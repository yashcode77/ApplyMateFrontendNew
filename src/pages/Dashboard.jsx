import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from '../config/axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JobApplicationTable } from '@/components/JobApplicationTable';
import { ApplicationForm } from '@/components/ApplicationForm';
import { toast } from 'react-toastify';
import { LogOut, Plus, FileText, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";

const Dashboard = () => {
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [viewingApplication, setViewingApplication] = useState(null);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('applications');
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSubmit = async (data) => {
    try {
      if (editingApplication) {
        await axios.put(`/applications/${editingApplication.id}`, data);
        toast.success('Application updated successfully');
      } else {
        console.log(data);
        await axios.post('/applications', data);
        toast.success('Application added successfully');
      }
      setIsFormOpen(false);
      setEditingApplication(null);
      fetchApplications();
    } catch (error) {
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save application');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await axios.delete(`applications/${id}`);
        toast.success('Application deleted successfully');
        fetchApplications();
      } catch (error) {
        toast.error('Failed to delete application');
      }
    }
  };

  const filteredApplications = applications.filter(app =>
    app?.companyName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    app?.jobTitle?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleViewApplication = async (application) => {
    try {
      console.log('Fetching interviews for application:', application.id);
      const response = await axios.get(`/interviews/application/${application.id}`);
      console.log('Interview response:', response.data);
      setViewingApplication({
        ...application,
        interviews: response.data
      });
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to fetch interview details');
      setViewingApplication(application);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">ApplyMate</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <Button 
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingApplication(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <JobApplicationTable
        applications={filteredApplications}
        onView={handleViewApplication}
        onEdit={(app) => {
          setEditingApplication(app);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingApplication ? 'Edit Application' : 'Add New Application'}
            </DialogTitle>
          </DialogHeader>
          <ApplicationForm
            initialData={editingApplication}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingApplication(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingApplication} onOpenChange={() => setViewingApplication(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {viewingApplication && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="mt-1">{viewingApplication.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Position</label>
                    <p className="mt-1">{viewingApplication.jobTitle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="mt-1">{viewingApplication.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Application Date</label>
                    <p className="mt-1">
                      {format(new Date(viewingApplication.applicationDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Job Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Job Description</h3>
                <p className="whitespace-pre-wrap">{viewingApplication.jobDescription || 'No description provided'}</p>
              </div>

              <Separator />

              {/* Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Links</h3>
                <div className="space-y-2">
                  {viewingApplication.jobUrl && (
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="w-4 h-4" />
                      <a
                        href={viewingApplication.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Job Posting
                      </a>
                    </div>
                  )}
                  {viewingApplication.resumeUrl && (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <a
                        href={`https://applymate.s3.ap-south-1.amazonaws.com/${viewingApplication.resumeUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Resume
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Interviews */}
              {/* Interviews */}
              {viewingApplication.interviews && viewingApplication.interviews.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Interviews</h3>
                    <div className="space-y-4">
                      {viewingApplication.interviews.map((interview, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg space-y-2 bg-gray-50"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Round</label>
                              <p className="mt-1">{interview.roundNumber}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Type</label>
                              <p className="mt-1">{interview.interviewType}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Status</label>
                              <p className="mt-1">{interview.status}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Date</label>
                              <p className="mt-1">
                                {format(new Date(interview.interviewDate), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                            {interview.notes && (
                              <div className="col-span-2">
                                <label className="text-sm font-medium text-gray-500">Notes</label>
                                <p className="mt-1 whitespace-pre-wrap">{interview.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;