import { apiRequest, USE_MOCK } from '../../../../api/client'
export const supportDashboardData = {
  officerName: 'Priya',
  stats: {
    openTickets: { value: 18, hint: 'Awaiting action' },
    inProgress: { value: 11, hint: 'Currently being handled' },
    resolvedToday: { value: 9, hint: 'Successfully completed' },
    pendingReply: { value: 6, hint: 'Awaiting response' },
  },
  attentionTickets: [
    {
      id: 'SUP-2048',
      subject: 'Appointment Booking Issue & Rescheduling',
      client: 'Alex Perera',
      clientId: 'BF-C1024',
      status: 'Open',
      priority: 'High',
      reason: 'High Priority · Waiting 45 min · Unassigned',
      waitingTime: 'Waiting 45 min',
      category: 'Appointment Support',
    },
    {
      id: 'SUP-2039',
      subject: 'Medication Allergy Pre-Check Query',
      client: 'Kasuni Abeysekara',
      clientId: 'BF-C1145',
      status: 'Escalated',
      priority: 'High',
      reason: 'Escalation pending with Medical Advisor',
      waitingTime: 'Review in progress',
      category: 'Health Check-up Support',
    },
    {
      id: 'SUP-2031',
      subject: 'Membership Tier Upgrade & Credits',
      client: 'Chris Almeida',
      clientId: 'BF-C1170',
      status: 'Open',
      priority: 'Low',
      reason: 'Unassigned incoming request',
      waitingTime: 'Waiting 15 min',
      category: 'Programme Questions',
    },
    {
      id: 'SUP-2047',
      subject: 'Meal Plan Recipe Alternatives',
      client: 'Taylor Kim',
      clientId: 'BF-C1102',
      status: 'Pending Client Reply',
      priority: 'Normal',
      reason: 'Client replied with dietary questions',
      waitingTime: 'Waiting 2 hours',
      category: 'Nutrition Support',
    },
  ],
  recentInquiries: [
    {
      id: 'inq-101',
      client: 'Alex Perera',
      subject: 'Can I reschedule my wellness appointment?',
      category: 'Appointment Support',
      time: '10 min ago',
      preview: 'Looking to shift my consultation to the afternoon slot on Friday.',
    },
    {
      id: 'inq-102',
      client: 'Kaveesha Bandara',
      subject: 'Where can I access the virtual session link?',
      category: 'Fitness Support',
      time: '35 min ago',
      preview: 'Need clarification whether the link is sent by email or in the portal.',
    },
    {
      id: 'inq-103',
      client: 'Chris Almeida',
      subject: 'How does consultation credit rollover work?',
      category: 'Programme Questions',
      time: '50 min ago',
      preview: 'Curious about unused specialist booking tokens at month end.',
    },
    {
      id: 'inq-104',
      client: 'Nilmini Jayasinghe',
      subject: 'Updating emergency contact and clinic preferences',
      category: 'Account Support',
      time: '2 hours ago',
      preview: 'Want to update my secondary emergency guardian contact phone number.',
    },
  ],
  categoryBreakdown: [
    { category: 'Appointment Support', count: 32, percentage: 30, color: '#005a40' },
    { category: 'Nutrition Support', count: 24, percentage: 22, color: '#00a67e' },
    { category: 'Fitness Support', count: 20, percentage: 19, color: '#0d9488' },
    { category: 'Health Check-up Support', count: 15, percentage: 14, color: '#14b8a6' },
    { category: 'Account Support', count: 10, percentage: 9, color: '#64748b' },
    { category: 'Programme Questions', count: 5, percentage: 5, color: '#94a3b8' },
    { category: 'Other', count: 2, percentage: 1, color: '#cbd5e1' },
  ],
  statusOverview: [
    { status: 'Open', count: 18, color: '#f59e0b', hint: 'Requires triage' },
    { status: 'In Progress', count: 11, color: '#0d9488', hint: 'Being worked on' },
    { status: 'Pending Client Reply', count: 6, color: '#f59e0b', hint: 'Client action needed' },
    { status: 'Escalated', count: 3, color: '#8b5cf6', hint: 'Specialist reviewing' },
    { status: 'Resolved Today', count: 9, color: '#005a40', hint: 'Handled successfully' },
  ],
  recentActivity: [
    { id: 'act-1', text: 'SUP-2048 placed in Support Queue (High Priority)', at: '10 min ago' },
    { id: 'act-2', text: 'Follow-up reply sent to Taylor Kim on SUP-2047', at: '25 min ago' },
    { id: 'act-3', text: 'SUP-2045 assigned to Priya Nair', at: '45 min ago' },
    { id: 'act-4', text: 'SUP-2041 marked as Resolved by Daniel Perera', at: '2 hours ago' },
    { id: 'act-5', text: 'SUP-2039 escalated to Medical Advisor Elena Costa', at: '3 hours ago' },
    { id: 'act-6', text: 'New client inquiry received from Nilmini Jayasinghe', at: '3.5 hours ago' },
  ],
  recentFeedback: [
    {
      id: 'fb-01',
      client: 'Nimali Silva',
      type: 'Positive Feedback',
      subject: 'The nutrition consultation was very helpful and practical.',
      date: 'Today',
      rating: 5,
    },
    {
      id: 'fb-02',
      client: 'Tharindu Mendis',
      type: 'Complaint',
      subject: 'Check-in delay was 20 minutes past booked appointment time.',
      date: 'Yesterday',
      status: 'Under Review',
    },
    {
      id: 'fb-03',
      client: 'Hansi Rathnayake',
      type: 'Suggestion',
      subject: 'Request for downloadable weekly grocery list in meal plan.',
      date: 'Sep 7',
      status: 'Acknowledged',
    },
  ],
  performance: {
    resolvedThisWeek: 47,
    avgFirstResponseMinutes: 14,
    avgResolutionHours: 3.4,
    positiveFeedbackPercentage: 98,
    slaCompliancePercentage: 96,
  },
}

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchSupportDashboard() {
  if (USE_MOCK) { await delay(); return structuredClone(supportDashboardData) }
  return apiRequest('/api/support/dashboard')
}
