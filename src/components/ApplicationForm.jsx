import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from 'lucide-react';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';

export const ApplicationForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        jobTitle: '',
        status: 'APPLIED',
        jobDescription: '',
        jobUrl: '',
        resumeUrl: '',
        applicationDate: new Date().toISOString().split('T')[0],
    });

    const [interviews, setInterviews] = useState([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                companyName: initialData.companyName || '',
                jobTitle: initialData.jobTitle || '',
                status: initialData.status || 'APPLIED',
                jobDescription: initialData.jobDescription || '',
                jobUrl: initialData.jobUrl || '',
                resumeUrl: initialData.resumeUrl || '',
                applicationDate: initialData.applicationDate?.split('T')[0] || new Date().toISOString().split('T')[0],
            });

            // Fetch and set existing interviews
            const fetchInterviews = async () => {
                try {
                    const response = await axios.get(`/interviews/application/${initialData.id}`);
                    console.log('Fetched interviews:', response.data);
                    setInterviews(response.data.map(interview => ({
                        id: interview.id,
                        roundNumber: interview.roundNumber,
                        interviewDate: new Date(interview.interviewDate).toISOString().slice(0, 16), // Format for datetime-local
                        interviewType: interview.interviewType,
                        notes: interview.notes,
                        status: interview.status
                    })));
                } catch (error) {
                    console.error('Error fetching interviews:', error);
                    toast.error('Failed to fetch interview details');
                }
            };

            if (initialData.id) {
                fetchInterviews();
            }
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const addInterview = () => {
        setInterviews([...interviews, {
            roundNumber: interviews.length + 1,
            interviewDate: new Date().toISOString().split('T')[0],
            interviewType: '',
            notes: '',
            status: 'SCHEDULED'
        }]);
    };

    const removeInterview = (index) => {
        setInterviews(interviews.filter((_, i) => i !== index));
    };

    const updateInterview = (index, field, value) => {
        const updatedInterviews = [...interviews];
        updatedInterviews[index] = {
            ...updatedInterviews[index],
            [field]: value
        };
        setInterviews(updatedInterviews);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, interviews });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Company</Label>
                    <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="jobTitle">Position</Label>
                    <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => handleInputChange({ target: { name: 'status', value } })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="APPLIED">Applied</SelectItem>
                            <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
                            <SelectItem value="TECHNICAL_INTERVIEW">Technical Interview</SelectItem>
                            <SelectItem value="FINAL_INTERVIEW">Final Interview</SelectItem>
                            <SelectItem value="OFFER_RECEIVED">Offer Received</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="jobUrl">Job URL</Label>
                    <Input
                        id="jobUrl"
                        name="jobUrl"
                        value={formData.jobUrl}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="applicationDate">Application Date</Label>
                    <Input
                        id="applicationDate"
                        name="applicationDate"
                        type="date"
                        value={formData.applicationDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                    id="jobDescription"
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    rows={4}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="resume">Resume</Label>
                <Input
                    id="resume"
                    name="resume"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Interviews</h3>
                    <Button type="button" onClick={addInterview}>Add Interview</Button>
                </div>

                {interviews.map((interview, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between">
                            <h4>Round {interview.roundNumber}</h4>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removeInterview(index)}
                            >
                                Remove
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>Date</label>
                                <Input
                                    type="datetime-local"
                                    value={interview.interviewDate}
                                    onChange={(e) => updateInterview(index, 'interviewDate', e.target.value)}
                                />
                            </div>

                            <div>
                                <label>Type</label>
                                <Select
                                    value={interview.interviewType}
                                    onValueChange={(value) => updateInterview(index, 'interviewType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TECHNICAL">Technical</SelectItem>
                                        <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                                        <SelectItem value="SYSTEM_DESIGN">System Design</SelectItem>
                                        <SelectItem value="HR">HR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label>Status</label>
                                <Select
                                    value={interview.status}
                                    onValueChange={(value) => updateInterview(index, 'status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-2">
                                <label>Notes</label>
                                <Textarea
                                    value={interview.notes}
                                    onChange={(e) => updateInterview(index, 'notes', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {initialData ? 'Update' : 'Submit'}
                </Button>
            </div>
        </form>
    );
}; 