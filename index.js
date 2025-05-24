document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-date').value = today;
    document.getElementById('current-date').textContent = formatDateForDisplay(today);
    
    // Load any existing data for today
    loadAttendanceData(today);
    
    // Add event listeners
    document.getElementById('add-btn').addEventListener('click', addStudent);
    document.getElementById('export-btn').addEventListener('click', exportToExcel);
    document.getElementById('clear-btn').addEventListener('click', clearTodayData);
    document.getElementById('attendance-date').addEventListener('change', dateChanged);
});

function formatDateForDisplay(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function dateChanged() {
    const selectedDate = document.getElementById('attendance-date').value;
    document.getElementById('current-date').textContent = formatDateForDisplay(selectedDate);
    loadAttendanceData(selectedDate);
}

function addStudent() {
    const name = document.getElementById('student-name').value.trim();
    const studentClass = document.getElementById('student-class').value.trim();
    const phone = document.getElementById('phone-number').value.trim();
    const date = document.getElementById('attendance-date').value;
    
    if (!name || !studentClass || !phone) {
        alert('Please fill in all fields');
        return;
    }
    
    // Create student object
    const student = {
        name,
        class: studentClass,
        phone,
        date,
        timestamp:new  Date().toISOString().split('T')[0]+' '+ new Date().toLocaleTimeString()
    };
    
    // Save to localStorage
    saveStudent(student);
    
    // Add to table
    addStudentToTable(student);
    
    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-class').value = '';
    document.getElementById('phone-number').value = '';
    document.getElementById('student-name').focus();
}

function saveStudent(student) {
    const dateKey = `attendance_${student.date}`;
    let students = JSON.parse(localStorage.getItem(dateKey)) || [];
    students.push(student);
    localStorage.setItem(dateKey, JSON.stringify(students));
}

function loadAttendanceData(date) {
    const dateKey = `attendance_${date}`;
    const students = JSON.parse(localStorage.getItem(dateKey)) || [];
    const tableBody = document.getElementById('student-table-body');
    tableBody.innerHTML = '';
    
    students.forEach((student, index) => {
        addStudentToTable(student, index + 1);
    });
}

function addStudentToTable(student, index) {
    const tableBody = document.getElementById('student-table-body');
    const row = document.createElement('tr');
    
    // If index isn't provided (when adding new student), calculate it
    if (!index) {
        index = tableBody.children.length + 1;
    }
    
    row.innerHTML = `
        <td>${index}</td>
        <td>${student.name}</td>
        <td>${student.class}</td>
        <td>${student.phone}</td>
        <td>${student.timestamp}</td>
        <td><button class="delete-btn" data-date="${student.date}" data-index="${index - 1}">Delete</button></td>
    `;
    
    tableBody.appendChild(row);
    
    // Add event listener to the delete button
    row.querySelector('.delete-btn').addEventListener('click', deleteStudent);
}

function deleteStudent(event) {
    const button = event.target;
    const date = button.getAttribute('data-date');
    const index = parseInt(button.getAttribute('data-index'));
    
    const dateKey = `attendance_${date}`;
    let students = JSON.parse(localStorage.getItem(dateKey)) || [];
    
    if (index >= 0 && index < students.length) {
        students.splice(index, 1);
        localStorage.setItem(dateKey, JSON.stringify(students));
        loadAttendanceData(date);
    }
}

function clearTodayData() {
    if (confirm('Are you sure you want to clear all data for the selected date?')) {
        const date = document.getElementById('attendance-date').value;
        const dateKey = `attendance_${date}`;
        localStorage.removeItem(dateKey);
        document.getElementById('student-table-body').innerHTML = '';
    }
}

function exportToExcel() {
    const date = document.getElementById('attendance-date').value;
    const dateKey = `attendance_${date}`;
    const students = JSON.parse(localStorage.getItem(dateKey)) || [];
    
    if (students.length === 0) {
        alert('No data to export for the selected date');
        return;
    }
    
    // Prepare data for Excel
    const excelData = [
        ['No.', 'Student Name', 'Class', 'Phone Number', 'Time'],
        ...students.map((student, index) => [
            index + 1,
            student.name,
            student.class,
            student.phone,
            student.timestamp
        ])
    ];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Attendance ${date}`);
    
    // Generate file name
    const fileName = `Student_Attendance_${date}.xlsx`;
    
    // Export to Excel
    XLSX.writeFile(wb, fileName);
}

//K@034!##