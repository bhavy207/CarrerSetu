import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step {
    _id: string;
    step_name: string;
    description: string;
    duration: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    completedAt?: string;
}

interface Path {
    _id: string;
    title: string;
    target_role: string;
    steps: Step[];
    isActive: boolean;
}

const Dashboard = () => {
    const [path, setPath] = useState<Path | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPath();
    }, []);

    const fetchPath = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://127.0.0.1:8000/api/v1/learner/current-path', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPath(response.data);
        } catch (error) {
            console.error("Error fetching path", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStepStatus = async (stepId: string, status: string) => {
        if (!path) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://127.0.0.1:8000/api/v1/learner/update-step', {
                pathId: path._id,
                stepId,
                status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPath(); // Refresh path to get updated status
        } catch (error) {
            console.error("Error updating step", error);
        }
    };

    if (loading) return <div className="text-center p-10">Loading Dashboard...</div>;

    if (!path) {
        return (
            <div className="text-center p-10">
                <h2 className="text-2xl font-bold mb-4">No Active Path Found</h2>
                <p className="mb-6">Start by generating your career profile.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Create New Path
                </button>
            </div>
        );
    }

    const completedSteps = path.steps.filter(s => s.status === 'Completed').length;
    const totalSteps = path.steps.length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient mb-2">{path.title}</h1>
                        <p className="text-gray-400">Target Role: {path.target_role}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-blue-400">{progress}%</div>
                        <div className="text-sm text-gray-400">Completed</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-gray-700 rounded-full mb-8 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                </div>

                <div className="space-y-4">
                    {path.steps.map((step, index) => (
                        <motion.div
                            key={step._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border transition-all ${step.status === 'Completed'
                                ? 'bg-green-500/10 border-green-500/30'
                                : step.status === 'In Progress'
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${step.status === 'Completed' ? 'text-green-400' : 'text-gray-400'
                                        }`}>
                                        {step.status === 'Completed' ? <CheckCircle size={24} /> : <Circle size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{step.step_name}</h3>
                                        <p className="text-sm text-gray-400">{step.description}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            <Clock size={12} />
                                            <span>{step.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {step.status !== 'Completed' && (
                                        <button
                                            onClick={() => updateStepStatus(step._id, 'Completed')}
                                            className="px-3 py-1 text-sm bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg transition"
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                    {step.status === 'Pending' && (
                                        <button
                                            onClick={() => updateStepStatus(step._id, 'In Progress')}
                                            className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition"
                                        >
                                            Start
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
