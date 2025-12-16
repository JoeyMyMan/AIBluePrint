import React, { useEffect, useState } from 'react';
import { HistoryRecord } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onLoadRecord: (record: HistoryRecord) => void;
}

const HistoryModal: React.FC<Props> = ({ isOpen, onClose, onLoadRecord }) => {
    const [records, setRecords] = useState<HistoryRecord[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Mock fetching from local storage for demo
            const saved = localStorage.getItem('my_blueprints');
            if (saved) {
                setRecords(JSON.parse(saved).sort((a: HistoryRecord, b: HistoryRecord) => b.timestamp - a.timestamp));
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <span className="mr-2">🔐</span> 私有云档案库
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">本地演示模式 (Local Storage)</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow">
                    {records.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="text-gray-500 text-sm">暂无记录。</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">目标</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {records.map((rec) => (
                                    <tr key={rec.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(rec.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {rec.profile.name}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {rec.target.school}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                                            <button 
                                                onClick={() => onLoadRecord(rec)}
                                                className="text-primary hover:text-teal-900 font-bold bg-teal-50 px-3 py-1 rounded hover:bg-teal-100 transition"
                                            >
                                                查看
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;