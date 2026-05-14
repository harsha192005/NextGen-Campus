# API Documentation

Complete REST API documentation for NextGen Smart Campus platform.

## 📋 Base URL

```
Development: http://localhost:5000/api
Production: https://your-backend.onrender.com/api
```

## 🔐 Authentication

All protected endpoints require JWT token in header:

```javascript
headers: {
  'Authorization': 'Bearer <your-jwt-token>',
  'Content-Type': 'application/json'
}
```

## 📍 API Endpoints

### Authentication (`/api/auth`)

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "Password123",
  "department": "Computer Science",
  "year": 3,
  "phone": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@college.edu",
    "role": "student",
    "department": "Computer Science",
    "year": 3,
    "xp": 0,
    "level": 1
  },
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@college.edu",
  "password": "Password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": { /* user object */ },
  "token": "jwt_token_here"
}
```

#### Get Current User
```http
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "user": { /* user object */ }
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@college.edu"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### Reset Password
```http
PUT /api/auth/reset-password/:token
```

**Request Body:**
```json
{
  "password": "NewPassword123"
}
```

### Events (`/api/events`)

#### Get All Events
```http
GET /api/events?category=technical&mode=offline&search=hackathon
```

**Query Parameters:**
- `category`: technical | non-tech | career | sports | hackathon
- `mode`: online | offline | hybrid
- `search`: search term
- `status`: upcoming | ongoing | completed
- `page`: page number (default: 1)
- `limit`: items per page (default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 25,
  "events": [
    {
      "id": "event_id",
      "title": "HackNova 2024",
      "description": "48-hour hackathon",
      "category": "hackathon",
      "banner": "image_url",
      "venue": "Main Auditorium",
      "mode": "offline",
      "startDate": "2024-03-15T00:00:00Z",
      "endDate": "2024-03-17T00:00:00Z",
      "registrationDeadline": "2024-03-10T00:00:00Z",
      "maxParticipants": 200,
      "currentParticipants": 145,
      "status": "upcoming",
      "organizer": { /* organizer info */ },
      "tags": ["Hackathon", "Coding"],
      "isFree": true,
      "createdAt": "2024-02-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 3,
    "total": 25
  }
}
```

#### Get Event by ID
```http
GET /api/events/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "event": { /* event object */ }
}
```

#### Create Event (Admin)
```http
POST /api/events
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "AI Workshop",
  "description": "Learn AI fundamentals",
  "category": "technical",
  "banner": "image_url",
  "venue": "Lab 301",
  "mode": "offline",
  "startDate": "2024-03-20T10:00:00Z",
  "endDate": "2024-03-20T17:00:00Z",
  "registrationDeadline": "2024-03-18T00:00:00Z",
  "maxParticipants": 50,
  "tags": ["AI", "ML", "Workshop"],
  "isFree": false,
  "fee": 500
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "event": { /* created event */ }
}
```

#### Update Event (Admin)
```http
PUT /api/events/:id
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:** (partial update supported)
```json
{
  "maxParticipants": 60,
  "status": "ongoing"
}
```

#### Delete Event (Admin)
```http
DELETE /api/events/:id
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Event deleted"
}
```

### Registrations (`/api/registrations`)

#### Register for Event
```http
POST /api/registrations
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "eventId": "event_id"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "registration": {
    "id": "reg_id",
    "userId": "user_id",
    "eventId": "event_id",
    "status": "registered",
    "qrCode": "qr_code_data",
    "registeredAt": "2024-03-01T00:00:00Z"
  }
}
```

#### Get User Registrations
```http
GET /api/registrations/my-events
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "registrations": [
    {
      /* registration with event details */
    }
  ]
}
```

#### Cancel Registration
```http
DELETE /api/registrations/:id
```

**Headers:** `Authorization: Bearer <token>`

### Teams (`/api/teams`)

#### Create Team
```http
POST /api/teams
```

**Request Body:**
```json
{
  "name": "Code Warriors",
  "hackathonId": "hackathon_id",
  "maxMembers": 4
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "team": {
    "id": "team_id",
    "name": "Code Warriors",
    "leaderId": "user_id",
    "members": ["user_id"],
    "hackathonId": "hackathon_id",
    "maxMembers": 4
  }
}
```

#### Invite Member
```http
POST /api/teams/:id/invite
```

**Request Body:**
```json
{
  "userId": "user_id_to_invite"
}
```

#### Join Team
```http
POST /api/teams/:id/join
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Joined team successfully"
}
```

#### Get Team Details
```http
GET /api/teams/:id
```

### Certificates (`/api/certificates`)

#### Get User Certificates
```http
GET /api/certificates/my-certificates
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "certificates": [
    {
      "id": "cert_id",
      "userId": "user_id",
      "eventId": "event_id",
      "certificateNumber": "CERT-2024-001",
      "qrVerificationCode": "VERIFY-123",
      "issuedAt": "2024-03-18T00:00:00Z",
      "event": { /* event details */ }
    }
  ]
}
```

#### Generate Certificate (Admin)
```http
POST /api/certificates/generate
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "userId": "user_id",
  "eventId": "event_id"
}
```

#### Verify Certificate
```http
GET /api/certificates/verify/:code
```

**Response:** `200 OK`
```json
{
  "success": true,
  "valid": true,
  "certificate": { /* certificate details */ }
}
```

### Attendance (`/api/attendance`)

#### Mark Attendance
```http
POST /api/attendance/mark
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "userId": "user_id",
  "eventId": "event_id",
  "qrCode": "scanned_qr_code"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "attendance": {
    "id": "attendance_id",
    "userId": "user_id",
    "eventId": "event_id",
    "checkInTime": "2024-03-15T10:30:00Z",
    "isLate": false
  }
}
```

#### Get Event Attendance
```http
GET /api/attendance/event/:eventId
```

**Headers:** `Authorization: Bearer <admin_token>`

### Analytics (`/api/analytics`)

#### Get Dashboard Analytics (Admin)
```http
GET /api/analytics/dashboard
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "analytics": {
    "totalEvents": 25,
    "totalRegistrations": 1250,
    "totalAttendance": 1100,
    "averageRating": 4.5,
    "departmentWiseData": [
      { "department": "Computer Science", "count": 450 }
    ],
    "eventTrends": [
      { "date": "2024-01", "registrations": 150 }
    ],
    "topEvents": [ /* events */ ],
    "topStudents": [ /* students */ ]
  }
}
```

#### Get Student Analytics
```http
GET /api/analytics/student/:studentId
```

### AI Features (`/api/ai`)

#### Chat with AI
```http
POST /api/ai/chat
```

**Request Body:**
```json
{
  "message": "Recommend events for me",
  "context": {
    "userId": "user_id",
    "department": "Computer Science"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "response": "Based on your profile, I recommend...",
  "suggestions": [ /* event suggestions */ ]
}
```

#### Get Event Recommendations
```http
POST /api/ai/recommendations
```

**Request Body:**
```json
{
  "userId": "user_id"
}
```

#### Analyze Feedback
```http
POST /api/ai/analyze-feedback
```

**Request Body:**
```json
{
  "eventId": "event_id"
}
```

### Feedback (`/api/feedback`)

#### Submit Feedback
```http
POST /api/feedback
```

**Request Body:**
```json
{
  "eventId": "event_id",
  "rating": 5,
  "comment": "Great event!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "feedback": {
    "id": "feedback_id",
    "userId": "user_id",
    "eventId": "event_id",
    "rating": 5,
    "comment": "Great event!",
    "sentiment": "positive",
    "createdAt": "2024-03-18T00:00:00Z"
  }
}
```

#### Get Event Feedback (Admin)
```http
GET /api/feedback/event/:eventId
```

### Student (`/api/student`)

#### Get Dashboard Data
```http
GET /api/student/dashboard
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "stats": {
      "eventsAttended": 12,
      "xp": 2500,
      "level": 5,
      "badges": 8
    },
    "upcomingEvents": [ /* events */ ],
    "recentActivity": [ /* activities */ ],
    "notifications": [ /* notifications */ ]
  }
}
```

#### Get Leaderboard
```http
GET /api/student/leaderboard?department=Computer Science
```

**Response:** `200 OK`
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user_id",
      "name": "John Doe",
      "xp": 5000,
      "level": 10,
      "department": "Computer Science"
    }
  ]
}
```

### Admin (`/api/admin`)

#### Get All Students
```http
GET /api/admin/students?page=1&limit=20
```

**Headers:** `Authorization: Bearer <admin_token>`

#### Update User Role
```http
PUT /api/admin/users/:id/role
```

**Request Body:**
```json
{
  "role": "organizer"
}
```

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## 🔒 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "details": [ /* optional validation errors */ ]
}
```

## 📝 Notes

1. All dates are in ISO 8601 format (UTC)
2. Pagination default: 10 items per page
3. Maximum file upload size: 5MB
4. Rate limiting: 100 requests per 15 minutes
5. JWT tokens expire after 7 days

## 🧪 Testing

Use these tools to test the API:
- Postman
- Insomnia
- Thunder Client (VS Code)
- curl

## 📚 Additional Resources

- Swagger documentation: `/api/docs` (when implemented)
- API changelog: `/api/changelog`
- Status page: `/api/status`

---

**API Version: 1.0.0**
