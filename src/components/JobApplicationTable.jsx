import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Search, Edit, Trash2, Eye } from 'lucide-react';

export const JobApplicationTable = ({
    applications,
    onView,
    onEdit,
    onDelete,
    searchTerm,
    setSearchTerm
}) => {
    return (
        <div className="space-y-4">
            <div className="relative max-w-sm">
                <Search className="absolute top-1/2 left-3 w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none" />
                <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>


            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Applied Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>{app.companyName}</TableCell>
                                <TableCell>{app.jobTitle}</TableCell>
                                <TableCell>{app.status}</TableCell>
                                <TableCell>
                                    {format(new Date(app.applicationDate), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onView(app)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(app)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(app.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}; 