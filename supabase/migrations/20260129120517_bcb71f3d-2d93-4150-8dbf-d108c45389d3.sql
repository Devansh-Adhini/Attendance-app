-- Create attendance_records table
CREATE TABLE public.attendance_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    branch TEXT NOT NULL CHECK (branch IN ('CSE', 'AI')),
    roll_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(date, roll_number)
);

-- Enable Row Level Security
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users only
CREATE POLICY "Authenticated users can view attendance"
ON public.attendance_records
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert attendance"
ON public.attendance_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update their own attendance"
ON public.attendance_records
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete their own attendance"
ON public.attendance_records
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);