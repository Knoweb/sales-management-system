import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { FormField, Input, Select, Textarea } from '../Forms';
import { projectExecutionApi } from '../../api/projectExecutionApi';
import { ProjectManagerSelector } from './selectors/ProjectManagerSelector';
import { Alert } from '../Alert';

interface SetupWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    onSuccess: () => void;
}

export const SetupWorkspaceModal: React.FC<SetupWorkspaceModalProps> = ({ isOpen, onClose, workspaceId, onSuccess }) => {
    const [projectManagerId, setProjectManagerId] = useState('');
    const [plannedStartDate, setPlannedStartDate] = useState('');
    const [plannedEndDate, setPlannedEndDate] = useState('');
    const [status, setStatus] = useState('PLANNED');
    const [executionNotes, setExecutionNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // managers are handled internally by ProjectManagerSelector now
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await projectExecutionApi.workspaces.setup(workspaceId, {
                projectManagerId,
                plannedStartDate: plannedStartDate || null,
                plannedEndDate: plannedEndDate || null,
                status,
                executionNotes
            });
            onSuccess();
            onClose();
        } catch (err) {
            const error = err as any;
            setError(error?.response?.data?.message || 'Failed to setup workspace');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Setup Workspace" maxWidth="600px">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <Alert variant="error">{error}</Alert>}
                <FormField label="Project Manager" required id="pm">
                    <ProjectManagerSelector 
                        value={projectManagerId} 
                        onChange={(val) => setProjectManagerId(val)} 
                    />
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormField label="Planned Start Date" id="start">
                        <Input type="date" id="start" value={plannedStartDate} onChange={e => setPlannedStartDate(e.target.value)} />
                    </FormField>
                    <FormField label="Planned End Date" id="end">
                        <Input type="date" id="end" value={plannedEndDate} onChange={e => setPlannedEndDate(e.target.value)} />
                    </FormField>
                </div>
                <FormField label="Status" required id="status">
                    <Select id="status" value={status} onChange={e => setStatus(e.target.value)} required>
                        <option value="PLANNED">PLANNED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="ON_HOLD">ON_HOLD</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </Select>
                </FormField>
                <FormField label="Execution Notes" id="notes">
                    <Textarea id="notes" value={executionNotes} onChange={e => setExecutionNotes(e.target.value)} />
                </FormField>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" isLoading={loading}>Save Setup</Button>
                </div>
            </form>
        </Modal>
    );
};
