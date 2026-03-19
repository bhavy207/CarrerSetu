import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface StatsData {
    users: number;
    courses: number;
    paths: number;
    recentUsers: Array<User>;
}

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
}

interface Course {
    _id: string;
    course_id: string;
    course_name: string;
    sector: string;
    nsqf_level: number;
    duration: string;
    job_role: string;
    skills_covered: string[];
}

const AdminCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(12px)',
            flex: 1,
            minWidth: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: color }} />
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{title}</h3>
        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{value}</span>
    </motion.div>
);

const AdminDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'courses'>('dashboard');

    // Course form state
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [courseForm, setCourseForm] = useState({
        course_id: '',
        course_name: '',
        sector: '',
        skills_covered: '',
        nsqf_level: 5,
        duration: '',
        job_role: ''
    });

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/v1/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (err: any) {
            setError('Failed to load admin stats. Are you an admin?');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/v1/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users");
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/v1/admin/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data);
        } catch (err) {
            console.error("Error fetching courses");
        }
    };

    useEffect(() => {
        if (token) {
            setLoading(true);
            Promise.all([fetchStats(), fetchUsers(), fetchCourses()]).finally(() => setLoading(false));
        }
    }, [token]);

    const handleDeleteUser = async (id: string, role: string) => {
        if (role === 'admin') {
            alert('Cannot delete an admin user!');
            return;
        }
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/v1/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchUsers();
                fetchStats();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Error deleting user');
            }
        }
    };

    const handleDeleteCourse = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/v1/admin/courses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchCourses();
                fetchStats();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Error deleting course');
            }
        }
    };

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/v1/admin/courses', courseForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAddingCourse(false);
            setCourseForm({
                course_id: '', course_name: '', sector: '', skills_covered: '',
                nsqf_level: 5, duration: '', job_role: ''
            });
            fetchCourses();
            fetchStats();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error adding course');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}><h2>Loading Dashboard...</h2></div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--brand-error)' }}><h2>{error}</h2></div>;

    const tabs = [
        { id: 'dashboard', label: 'Overview' },
        { id: 'users', label: 'Manage Users' },
        { id: 'courses', label: 'Manage Courses' }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '2rem 0' }}>
            {/* Header & Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <span className="badge badge-error" style={{ marginBottom: '0.5rem' }}>Admin Area</span>
                    <h1 className="gradient-text" style={{ margin: '0.5rem 0' }}>System Dashboard</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                background: activeTab === tab.id ? 'var(--brand-500)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB: DASHBOARD */}
            <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                    <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
                            <AdminCard title="Total Users" value={stats?.users || 0} color="#6366f1" />
                            <AdminCard title="Courses Available" value={stats?.courses || 0} color="#22d3ee" />
                            <AdminCard title="Paths Generated" value={stats?.paths || 0} color="#a78bfa" />
                        </div>

                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Users</h2>
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '1rem' }}>Username</th>
                                        <th style={{ padding: '1rem' }}>Email</th>
                                        <th style={{ padding: '1rem' }}>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recentUsers.map(user => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                                            <td style={{ padding: '1rem' }}>{user.username} {user.role === 'admin' && <span className="badge badge-error" style={{ marginLeft: 8, fontSize: '0.6rem' }}>Admin</span>}</td>
                                            <td style={{ padding: '1rem' }}>{user.email}</td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                                        <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent users</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* TAB: USERS */}
                {activeTab === 'users' && (
                    <motion.div key="users" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem' }}>All Users ({users.length})</h2>
                        </div>
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '1rem' }}>ID</th>
                                        <th style={{ padding: '1rem' }}>Username</th>
                                        <th style={{ padding: '1rem' }}>Email</th>
                                        <th style={{ padding: '1rem' }}>Role</th>
                                        <th style={{ padding: '1rem' }}>Joined</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                                            <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user._id}</td>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>{user.username}</td>
                                            <td style={{ padding: '1rem' }}>{user.email}</td>
                                            <td style={{ padding: '1rem' }}>
                                                {user.role === 'admin' ? 
                                                    <span className="badge badge-error">Admin</span> : 
                                                    <span className="badge badge-brand">User</span>
                                                }
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button 
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--brand-error)' }}
                                                    onClick={() => handleDeleteUser(user._id, user.role)}
                                                    disabled={user.role === 'admin'}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* TAB: COURSES */}
                {activeTab === 'courses' && (
                    <motion.div key="courses" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem' }}>Course Catalog ({courses.length})</h2>
                            <button className="btn btn-primary btn-sm" onClick={() => setIsAddingCourse(!isAddingCourse)}>
                                {isAddingCourse ? 'Cancel' : '+ Add Course'}
                            </button>
                        </div>

                        <AnimatePresence>
                            {isAddingCourse && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden', marginBottom: '2rem' }}
                                >
                                    <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--brand-500)' }}>
                                        <h3 style={{ marginBottom: '1rem' }}>Add New Course</h3>
                                        <form onSubmit={handleAddCourse} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Course ID</label>
                                                <input className="form-input" required value={courseForm.course_id} onChange={e => setCourseForm({...courseForm, course_id: e.target.value})} placeholder="e.g. IT-101" />
                                            </div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Course Name</label>
                                                <input className="form-input" required value={courseForm.course_name} onChange={e => setCourseForm({...courseForm, course_name: e.target.value})} placeholder="e.g. Intro to Python" />
                                            </div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Sector</label>
                                                <input className="form-input" required value={courseForm.sector} onChange={e => setCourseForm({...courseForm, sector: e.target.value})} placeholder="e.g. IT/ITeS" />
                                            </div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Job Role</label>
                                                <input className="form-input" required value={courseForm.job_role} onChange={e => setCourseForm({...courseForm, job_role: e.target.value})} placeholder="e.g. Software Developer" />
                                            </div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">NSQF Level</label>
                                                <input className="form-input" type="number" min="1" max="10" required value={courseForm.nsqf_level} onChange={e => setCourseForm({...courseForm, nsqf_level: Number(e.target.value)})} />
                                            </div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Duration</label>
                                                <input className="form-input" required value={courseForm.duration} onChange={e => setCourseForm({...courseForm, duration: e.target.value})} placeholder="e.g. 6 Months" />
                                            </div>
                                            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                                                <label className="form-label">Skills Covered (comma separated)</label>
                                                <input className="form-input" required value={courseForm.skills_covered} onChange={e => setCourseForm({...courseForm, skills_covered: e.target.value})} placeholder="e.g. Python, SQL, REST APIs" />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                                <button type="submit" className="btn btn-primary">Save Course</button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '1rem' }}>ID</th>
                                        <th style={{ padding: '1rem' }}>Name</th>
                                        <th style={{ padding: '1rem' }}>Sector</th>
                                        <th style={{ padding: '1rem' }}>Level</th>
                                        <th style={{ padding: '1rem' }}>Job Role</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map(course => (
                                        <tr key={course._id} style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>{course.course_id}</td>
                                            <td style={{ padding: '1rem' }}>{course.course_name}</td>
                                            <td style={{ padding: '1rem' }}>{course.sector}</td>
                                            <td style={{ padding: '1rem' }}>NSQF {course.nsqf_level}</td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{course.job_role}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button 
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--brand-error)' }}
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {courses.length === 0 && (
                                        <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No courses available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminDashboard;
