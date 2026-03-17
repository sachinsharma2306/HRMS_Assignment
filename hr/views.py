from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer


class EmployeeListCreateView(APIView):

    def get(self, request):
        employees = Employee.objects.all().order_by('-created_at')
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data

        required = ['employee_id', 'full_name', 'email', 'department']
        for field in required:
            if not data.get(field, '').strip():
                return Response(
                    {'error': f'{field} is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            validate_email(data['email'])
        except ValidationError:
            return Response({'error': 'Enter a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)

        if Employee.objects.filter(employee_id=data['employee_id']).exists():
            return Response({'error': 'Employee ID already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        if Employee.objects.filter(email=data['email']).exists():
            return Response({'error': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = EmployeeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployeeDetailView(APIView):

    def get_object(self, pk):
        try:
            return Employee.objects.get(pk=pk)
        except Employee.DoesNotExist:
            return None

    def get(self, request, pk):
        employee = self.get_object(pk)
        if not employee:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)

    def delete(self, request, pk):
        employee = self.get_object(pk)
        if not employee:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        employee.delete()
        return Response({'message': 'Employee deleted.'}, status=status.HTTP_200_OK)


class AttendanceListCreateView(APIView):

    def get(self, request):
        employee_id = request.query_params.get('employee_id')
        date = request.query_params.get('date')

        records = Attendance.objects.select_related('employee').all().order_by('-date')

        if employee_id:
            records = records.filter(employee_id=employee_id)
        if date:
            records = records.filter(date=date)

        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data

        if not data.get('employee'):
            return Response({'error': 'Employee is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not data.get('date'):
            return Response({'error': 'Date is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if data.get('status') not in ['Present', 'Absent']:
            return Response({'error': 'Status must be Present or Absent.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check duplicate
        if Attendance.objects.filter(employee_id=data['employee'], date=data['date']).exists():
            return Response(
                {'error': 'Attendance already marked for this employee on this date.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AttendanceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttendanceDetailView(APIView):

    def delete(self, request, pk):
        try:
            record = Attendance.objects.get(pk=pk)
            record.delete()
            return Response({'message': 'Record deleted.'})
        except Attendance.DoesNotExist:
            return Response({'error': 'Record not found.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            record = Attendance.objects.get(pk=pk)
        except Attendance.DoesNotExist:
            return Response({'error': 'Record not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['Present', 'Absent']:
            return Response({'error': 'Status must be Present or Absent.'}, status=status.HTTP_400_BAD_REQUEST)

        record.status = new_status
        record.save()
        serializer = AttendanceSerializer(record)
        return Response(serializer.data)


class DashboardView(APIView):

    def get(self, request):
        total_employees = Employee.objects.count()
        total_present_today = Attendance.objects.filter(
            date=__import__('datetime').date.today(), status='Present'
        ).count()
        total_absent_today = Attendance.objects.filter(
            date=__import__('datetime').date.today(), status='Absent'
        ).count()
        departments = list(
            Employee.objects.values_list('department', flat=True).distinct()
        )

        return Response({
            'total_employees': total_employees,
            'present_today': total_present_today,
            'absent_today': total_absent_today,
            'departments': len(departments),
        })