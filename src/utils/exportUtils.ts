import { supabase } from '@/supabaseClient';
import * as XLSX from 'xlsx';
import { allStudents } from '@/data/students';

interface IdentifierRecord {
    Hash: string;
    timestamp: string;
    remark: string;
}

interface AttendanceRecord {
    Hash: string;
    id: string; // rollNumber
    Name: string;
    Attendance: number;
}

export const exportAttendanceToExcel = async () => {
    try {
        // 1. Fetch all Identifiers (dates)
        const { data: identifiers, error: idError } = await supabase
            .from('Identifier')
            .select('*')
            .order('timestamp', { ascending: true });

        if (idError) throw idError;
        if (!identifiers || identifiers.length === 0) {
            alert('No attendance records found.');
            return;
        }

        // 2. Fetch all Attendance records with pagination
        // Supabase has a default limit of 1000 rows per request.
        let allAttendance: any[] = [];
        let rangeStart = 0;
        const PAGE_SIZE = 1000;

        while (true) {
            const { data: batch, error: attError } = await supabase
                .from('Attendance')
                .select('*')
                .range(rangeStart, rangeStart + PAGE_SIZE - 1);

            if (attError) throw attError;

            if (batch && batch.length > 0) {
                allAttendance = [...allAttendance, ...batch];
                rangeStart += PAGE_SIZE;

                // If we got fewer records than requested, we've reached the end
                if (batch.length < PAGE_SIZE) break;
            } else {
                break;
            }
        }

        const attendanceData = allAttendance;

        // 3. Process Dates (Columns)
        const dateColumns: { hash: string; label: string }[] = identifiers.map((id: IdentifierRecord) => {
            const date = new Date(id.timestamp);
            // Format: dd-mm-yyyy HH:MM
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return {
                hash: id.Hash,
                label: `${day}-${month}-${year} ${hours}:${minutes}`
            };
        });

        // 4. Build Attendance Lookup Map
        // Key: `${Hash}_${RollNumber}` -> Value: Attendance Status
        const attendanceLookup = new Map<string, any>();
        (attendanceData as AttendanceRecord[]).forEach(record => {
            const key = `${record.Hash}_${record.id}`;
            attendanceLookup.set(key, record.Attendance);
        });

        // 5. Build Rows
        const rows: any[] = [];

        // Split students by branch
        const cseStudents = allStudents.filter(s => s.branch === 'CSE');
        const aiStudents = allStudents.filter(s => s.branch === 'AI');

        const generateStudentRow = (student: typeof allStudents[0]) => {
            const row: any = {
                'Roll Number': student.rollNumber,
                'Name': student.name,
            };

            let presentCount = 0;
            let validSessionsCount = 0;

            dateColumns.forEach(col => {
                const key = `${col.hash}_${student.rollNumber}`;
                const status = attendanceLookup.get(key);

                row[col.label] = status !== undefined ? status : '';

                // Calculate Totals
                if (status === 1) {
                    presentCount++;
                    validSessionsCount++;
                } else if (status === 0) {
                    validSessionsCount++;
                }
            });

            // Add Total Column
            row['Total Attendance'] = `${presentCount}/${validSessionsCount}`;

            // Add Percentage Column
            const percentage = validSessionsCount > 0
                ? ((presentCount / validSessionsCount) * 100).toFixed(2)
                : '0.00';
            row['Attendance Percentage'] = `${percentage}%`;

            return row;
        };

        // Add CSE Students
        cseStudents.forEach(student => {
            rows.push(generateStudentRow(student));
        });

        // Add Separator Row (empty object) if there are AI students
        if (cseStudents.length > 0 && aiStudents.length > 0) {
            rows.push({});
        }

        // Add AI Students
        aiStudents.forEach(student => {
            rows.push(generateStudentRow(student));
        });

        // 6. Generate Excel
        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Set Column Widths
        const colWidths = [
            { wch: 15 }, // Roll Number
            { wch: 30 }, // Name
            ...dateColumns.map(() => ({ wch: 18 })), // Dates
            { wch: 15 }, // Total Attendance
            { wch: 20 }, // Percentage
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

        // 7. Download
        XLSX.writeFile(workbook, 'Attendance_Export.xlsx');

    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export attendance. Check console for details.');
    }
};
