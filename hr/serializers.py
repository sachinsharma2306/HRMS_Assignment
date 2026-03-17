from rest_framework import serializers
from .models import Employee, Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'date', 'status']


class EmployeeSerializer(serializers.ModelSerializer):
    total_present = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department', 'created_at', 'total_present']

    def get_total_present(self, obj):
        return obj.attendance_records.filter(status='Present').count()