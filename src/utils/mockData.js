export const users = [
    {
        id: 'emp001',
        name: 'Ali Raza',
        email: 'ali@hunarmand.com',
        password: 'password123',
        role: 'employee',
        erpId: 'HP-1023',
        department: 'Textile',
        title: 'Senior Technician',
        workplace: 'Lahore Factory',
        shift: '09:00 - 17:00',
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=ali',
        salary: 75000,
        joiningDate: '2023-01-15',
        stats: {
            present: 22,
            late: 3,
            absent: 1
        }
    },
    {
        id: 'admin001',
        name: 'Hassan Khan',
        email: 'admin@hunarmand.com',
        password: 'adminpassword',
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?u=hassan',
    }
];

export const workProgress = [
    { id: 1, userId: 'emp001', userName: 'Ali Raza', date: '2023-10-05', task: 'Completed stitching unit maintenance.', status: 'Reviewed' },
    { id: 2, userId: 'emp001', userName: 'Ali Raza', date: '2023-10-04', task: ' Inspected dyeing machine sensors.', status: 'Pending' },
];

export const attendanceData = [
    { date: '2023-10-01', status: 'present', checkIn: '09:05 AM', checkOut: '05:00 PM' },
    { date: '2023-10-02', status: 'present', checkIn: '08:55 AM', checkOut: '05:10 PM' },
    { date: '2023-10-03', status: 'late', checkIn: '09:30 AM', checkOut: '05:30 PM' },
    { date: '2023-10-04', status: 'absent', checkIn: '-', checkOut: '-' },
    { date: '2023-10-05', status: 'present', checkIn: '09:00 AM', checkOut: '05:00 PM' },
    { date: '2023-10-05', status: 'present', checkIn: '09:00 AM', checkOut: '05:00 PM' },
];

export const notifications = [
    { id: 1, text: "Welcome to Hunarmand Punjab!", date: "2023-10-01", read: false },
    { id: 2, text: "Please mark your attendance on time.", date: "2023-10-02", read: true },
];

export const addEmployee = (newEmployee) => {
    const id = `emp${String(users.length + 1).padStart(3, '0')}`;
    const emp = { ...newEmployee, id, role: 'employee', avatar: `https://i.pravatar.cc/150?u=${id}` };
    users.push(emp);
    return emp;
};

export const addNotification = (message) => {
    const id = notifications.length + 1;
    notifications.unshift({ id, text: message, date: new Date().toISOString().split('T')[0], read: false });
};

export const submitProgress = (progress) => {
    // progress: { userId, userName, task }
    const id = workProgress.length + 1;
    workProgress.unshift({
        id,
        ...progress,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
    });
};

