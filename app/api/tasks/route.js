import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import { getServerSession } from '@/src/lib/auth-server';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    let staffId = searchParams.get('staffId');

    // RBAC: Staff/Freelancers only see their own tasks
    const role = session.user.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);
    if (!isManagement) {
      staffId = session.staffId;
      if (!staffId) {
        return NextResponse.json([]); // No linked staff record -> no tasks
      }
    }

    let query = 'SELECT t.*, s.name as assignedToName, p.name as projectName FROM tasks t ';
    query += 'LEFT JOIN staff s ON t.assignedTo = s.id ';
    query += 'LEFT JOIN projects p ON t.projectId = p.id ';
    query += 'WHERE t.isActive = TRUE ';
    
    const params = [];
    if (staffId) {
      query += 'AND t.assignedTo = ? ';
      params.push(staffId);
    }
    if (projectId) {
      query += 'AND t.projectId = ? ';
      params.push(projectId);
    }
    if (status) {
      query += 'AND t.status = ? ';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await pool.query(query, params);
    
    // Auto-calculate 'Delayed' status
    const today = new Date().toISOString().split('T')[0];
    const tasksWithAutoStatus = rows.map(t => {
      if (t.status !== 'Completed' && t.status !== 'Approved' && t.status !== 'Delayed' && t.dueDate && t.dueDate < today) {
        return { ...t, status: 'Delayed' };
      }
      return t;
    });

    return NextResponse.json(tasksWithAutoStatus);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

import { logActivity } from '@/src/lib/activity';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { title, description, assignedTo, projectId, status, priority, startDate, dueDate, fileUrl, notes } = body;
    const id = 'task_' + Date.now();

    const role = session.user.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    if (!isManagement) {
      assignedTo = session.staffId;
    }

    const finalStatus = status || 'Not Started';
    const finalNotes = Array.isArray(notes) ? JSON.stringify(notes) : (notes || '[]');

    await pool.query(
      `INSERT INTO tasks (id, title, description, assignedTo, assignedBy, projectId, status, priority, startDate, dueDate, fileUrl, reviewStatus, notes, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, TRUE)`,
      [id, title, description || '', assignedTo || null, session.user.id, projectId || null, finalStatus, priority || 'Medium', startDate || null, dueDate || null, fileUrl || null, finalNotes]
    );

    await logActivity(session.user.id, 'Created Task', 'Tasks', { taskId: id, title });

    return NextResponse.json({ id, title, status: finalStatus });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, status, notes } = body;

    const [existing] = await pool.query('SELECT assignedTo, title FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const role = session.user.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    if (!isManagement && existing[0].assignedTo !== session.staffId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let finalCompletedDate = body.completedDate || null;
    if (status === 'Completed' && !finalCompletedDate) {
      finalCompletedDate = new Date().toISOString().split('T')[0];
    } else if (status !== 'Completed') {
      finalCompletedDate = null;
    }

    const finalNotes = Array.isArray(notes) ? JSON.stringify(notes) : (notes || '[]');
    
    let query, params;
    
    if (isManagement) {
      // Management can update everything + review fields
      query = 'UPDATE tasks SET title=?, description=?, assignedTo=?, status=?, priority=?, startDate=?, dueDate=?, completedDate=?, fileUrl=?, reviewStatus=?, reviewNotes=?, notes=? WHERE id=?';
      params = [title, body.description || '', body.assignedTo || null, status, body.priority, body.startDate || null, body.dueDate || null, finalCompletedDate, body.fileUrl || null, body.reviewStatus || 'Pending', body.reviewNotes || '', finalNotes, id];
    } else {
      // Staff can only update status and fileUrl
      query = 'UPDATE tasks SET status=?, completedDate=?, fileUrl=?, notes=? WHERE id=?';
      params = [status, finalCompletedDate, body.fileUrl || null, finalNotes, id];
    }

    await pool.query(query, params);
    
    await logActivity(session.user.id, 'Updated Task', 'Tasks', { taskId: id, status });

    return NextResponse.json({ success: true, completedDate: finalCompletedDate });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession();
    const role = session?.user?.role?.toLowerCase();
    const isManagement = ['founder', 'admin', 'hr'].includes(role);

    if (!session || !isManagement) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await pool.query('UPDATE tasks SET isActive = FALSE WHERE id = ?', [id]);
    
    await logActivity(session.user.id, 'Deleted Task', 'Tasks', { taskId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
