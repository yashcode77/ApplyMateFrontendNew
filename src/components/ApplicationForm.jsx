import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from 'lucide-react';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';

export const ApplicationForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        companyName: '',
        jobTitle: '',
        status: 'APPLIED',
        jobDescription: '',
        jobUrl: '',
        applicationDate: new Date().toISOString().split('T')[0],
        resumeUrl: null,
        interviews: []
    });

    const [interviews, setInterviews] = useState(initialData?.interviews || []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const addInterview = () => {
        setInterviews(prev => [...prev, {
            type: '',
            date: '',
            notes: '',
            status: 'SCHEDULED'
        }]);
    };

    const removeInterview = (index) => {
        setInterviews(prev => prev.filter((_, i) => i !== index));
    };

    const updateInterview = (index, field, value) => {
        setInterviews(prev => prev.map((interview, i) =>
            i === index ? { ...interview, [field]: value } : interview
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedInterviews = interviews.map((interview, index) => ({
            roundNumber: index + 1,
            interviewDate: new Date(interview.date).toISOString(),
            interviewType: interview.type,
            notes: interview.notes || '',
            status: interview.status
        }));

        const applicationData = {
            companyName: formData.companyName,
            jobTitle: formData.jobTitle,
            status: formData.status,
            jobDescription: formData.jobDescription,
            jobUrl: formData.jobUrl || '',
            applicationDate: new Date(formData.applicationDate).toISOString(),
            resumeUrl: formData.resumeUrl,
            interviews: formattedInterviews
        };

        if (formData.resume) {
            const resumeData = new FormData();
            resumeData.append('file', formData.resume);

            axios.post('/files/upload-resume', resumeData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(response => {
                    applicationData.resumeUrl = response.data;
                    onSubmit(applicationData);
                })
                .catch(error => {
                    console.error('Resume upload failed:', error);
                    toast.error('Failed to upload resume. Please try again.');
                });
        } else {
            console.log(applicationData);
            onSubmit(applicationData);
        }
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
                <div className="flex items-center justify-between">
                    <Label>Interviews</Label>
                    <Button type="button" onClick={addInterview} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Interview
                    </Button>
                </div>

                {interviews.map((interview, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium">Interview {index + 1}</h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeInterview(index)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Input
                                    value={interview.type}
                                    onChange={(e) => updateInterview(index, 'type', e.target.value)}
                                    placeholder="e.g., Technical, HR"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                    type="datetime-local"
                                    value={interview.date}
                                    onChange={(e) => updateInterview(index, 'date', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={interview.status}
                                    onValueChange={(value) => updateInterview(index, 'status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={interview.notes}
                                    onChange={(e) => updateInterview(index, 'notes', e.target.value)}
                                    rows={2}
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