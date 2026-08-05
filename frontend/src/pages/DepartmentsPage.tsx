import React, { useEffect, useState } from 'react';
import {
  Building2,
  Eye,
  Plus,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { DepartmentApi } from '../services/DepartmentApi';
import type { Department } from '../types/department';

import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { IconButton } from '../components/IconButton';
import { Input } from '../components/Forms';
import {
  EmptyState,
  LoadingState,
} from '../components/FeedbackStates';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<
    Department[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  const loadDepartments = async () => {
    try {
      setLoading(true);

      const data = await DepartmentApi.search();

      setDepartments(data.content || []);
    } catch (error) {
      console.error(
        'Failed to load departments',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDepartments();
  }, []);

  const filteredDepartments = departments.filter(
    (department) => {
      const searchValue = search
        .trim()
        .toLowerCase();

      return (
        department.name
          .toLowerCase()
          .includes(searchValue) ||
        department.code
          .toLowerCase()
          .includes(searchValue)
      );
    }
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Departments"
        description="Manage company organizational structure."
        icon={<Building2 size={24} />}
        actionButton={{
          label: 'Add Department',
          show: Boolean(
            user?.permissions.includes(
              'DEPARTMENT_WRITE'
            )
          ),
          onClick: () =>
            navigate('/departments/new'),
          icon: <Plus size={16} />,
        }}
      />

      <div className="mb-5">
        <Input
          type="search"
          placeholder="Search by department name or code..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: '16px',
            paddingRight: '16px',
            borderRadius: '9px',
          }}
        />
      </div>

      <Card>
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <LoadingState message="Loading departments..." />
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <EmptyState
              icon={<Search size={44} />}
              title="No departments found"
              message={
                search
                  ? 'No departments match your search criteria.'
                  : 'No departments are available in the system.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Code</TableHeader>

                  <TableHeader>Name</TableHeader>

                  <TableHeader>Status</TableHeader>

                  <TableHeader>
                    Employees
                  </TableHeader>

                  <TableHeader>
                    Active HOD
                  </TableHeader>

                  <TableHeader align="right">
                    Actions
                  </TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredDepartments.map(
                  (department) => (
                    <TableRow key={department.id}>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {department.code}
                        </span>
                      </TableCell>

                      <TableCell>
                        {department.name}
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          status={
                            department.active
                              ? 'Active'
                              : 'Inactive'
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {department.employeeCount}
                      </TableCell>

                      <TableCell>
                        {department.activeHod ? (
                          `${department.activeHod.firstName} ${department.activeHod.lastName}`
                        ) : (
                          <span className="text-gray-500">
                            Not Assigned
                          </span>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <div className="flex justify-end">
                          <IconButton
                            type="button"
                            icon={<Eye size={16} />}
                            onClick={() =>
                              navigate(
                                `/departments/${department.id}`
                              )
                            }
                            title="View Details"
                            aria-label={`View ${department.name} details`}
                            variant="ghost"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};