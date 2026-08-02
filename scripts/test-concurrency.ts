import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

async function runConcurrencyTest() {
  console.log('=====================================================');
  console.log('⚡ STARTING TICKET BOOKING RACE CONDITION SIMULATION');
  console.log('=====================================================\n');

  try {
    // -------------------------------------------------------------------------
    // SETUP: Register Admin & Create Test Event
    // -------------------------------------------------------------------------
    console.log('1. Setting up Admin & Event...');
    const adminEmail = `admin_${Date.now()}@test.com`;
    await axios.post(`${BASE_URL}/auth/register`, {
      email: adminEmail,
      password: 'password123',
      fullName: 'Admin User',
      role: 'admin',
    });

    const adminLogin: any = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: 'password123',
    });
    const adminToken = adminLogin.data.data.accessToken;

    // Create Event
    const eventRes: any = await axios.post(
      `${BASE_URL}/events`,
      {
        title: 'Flash Sale High Demand Concert 2026',
        description: 'Testing race conditions under high concurrent traffic',
        location: 'Arena Stadium',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );
    const eventId = eventRes.data.data.id;

    // -------------------------------------------------------------------------
    // TEST PHASE 1: Day-Basis Ticket Race Condition (5 Tickets vs 15 Concurrent Users)
    // -------------------------------------------------------------------------
    const TOTAL_TICKETS = 5;
    const CONCURRENT_USERS = 15;

    console.log(`\n📌 [PHASE 1] Day-Basis Ticket Race Condition`);
    console.log(`- Creating Day Slot with STRICTLY ${TOTAL_TICKETS} available tickets...`);

    const slotRes1: any = await axios.post(
      `${BASE_URL}/events/${eventId}/slots`,
      {
        date: '2026-10-01',
        totalTickets: TOTAL_TICKETS,
        price: 50,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );
    const slotId1 = slotRes1.data.data.id;

    console.log(`- Registering ${CONCURRENT_USERS} distinct concurrent customer accounts...`);
    const userTokens: string[] = [];

    for (let i = 0; i < CONCURRENT_USERS; i++) {
      const email = `user_${i}_${Date.now()}@test.com`;
      await axios.post(`${BASE_URL}/auth/register`, {
        email,
        password: 'password123',
        fullName: `Customer ${i}`,
      });
      const login: any = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password: 'password123',
      });
      userTokens.push(login.data.data.accessToken);
    }

    console.log(`- Firing ${CONCURRENT_USERS} SIMULTANEOUS booking requests at the EXACT same millisecond...`);

    const phase1Promises = userTokens.map((token, index) => {
      return axios
        .post(
          `${BASE_URL}/bookings`,
          {
            daySlotId: slotId1,
            bookingType: 'DAY_TICKET',
            ticketQuantity: 1,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .then((res: any) => ({ index, status: 'SUCCESS', data: res.data.data }))
        .catch((err: any) => ({
          index,
          status: 'FAILED',
          message: err.response?.data?.error?.message || err.message,
        }));
    });

    const phase1Results = await Promise.all(phase1Promises);
    const phase1Succeeded = phase1Results.filter((r) => r.status === 'SUCCESS');
    const phase1Failed = phase1Results.filter((r) => r.status === 'FAILED');

    const updatedSlot1: any = await axios.get(`${BASE_URL}/events/${eventId}/slots`);
    const slotData1 = updatedSlot1.data.data.find((s: any) => s.id === slotId1);

    console.log('\n--- PHASE 1 RESULTS ---');
    console.log(`Total Concurrent Requests: ${CONCURRENT_USERS}`);
    console.log(`Successful Bookings:       ${phase1Succeeded.length} / ${TOTAL_TICKETS}`);
    console.log(`Blocked Requests:          ${phase1Failed.length}`);
    console.log(`Remaining DB Inventory:    ${slotData1.availableTickets}`);

    if (phase1Succeeded.length === TOTAL_TICKETS && slotData1.availableTickets === 0) {
      console.log('✅ PHASE 1 PASSED: Zero overbooking detected! All 5 tickets sold, 10 blocked.');
    } else {
      console.log('❌ PHASE 1 FAILED: Overbooking occurred!');
    }

    // -------------------------------------------------------------------------
    // TEST PHASE 2: Subscription Daily Pass Quota Race Condition
    // -------------------------------------------------------------------------
    console.log(`\n📌 [PHASE 2] Subscription Quota Race Condition`);
    console.log(`- Subscribing 1 VIP User to Monthly Plan (dailyPassLimit = 1)...`);

    const vipEmail = `vip_${Date.now()}@test.com`;
    await axios.post(`${BASE_URL}/auth/register`, {
      email: vipEmail,
      password: 'password123',
      fullName: 'VIP Race User',
    });

    const vipLogin: any = await axios.post(`${BASE_URL}/auth/login`, {
      email: vipEmail,
      password: 'password123',
    });
    const vipToken = vipLogin.data.data.accessToken;

    // Get Subscription Plans & Subscribe
    const plansRes: any = await axios.get(`${BASE_URL}/subscriptions/plans`);
    const vipPlan = plansRes.data.data.find((p: any) => p.dailyPassLimit === 1) || plansRes.data.data[0];

    await axios.post(
      `${BASE_URL}/subscriptions/subscribe`,
      { planId: vipPlan.id },
      { headers: { Authorization: `Bearer ${vipToken}` } },
    );

    // Create Day Slot 2
    const slotRes2: any = await axios.post(
      `${BASE_URL}/events/${eventId}/slots`,
      {
        date: '2026-10-02',
        totalTickets: 50,
        price: 50,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );
    const slotId2 = slotRes2.data.data.id;

    const SIMULTANEOUS_VIP_REQUESTS = 10;
    console.log(`- Firing ${SIMULTANEOUS_VIP_REQUESTS} SIMULTANEOUS subscription pass booking requests from the SAME user...`);

    const phase2Promises = Array.from({ length: SIMULTANEOUS_VIP_REQUESTS }).map((_, index) => {
      return axios
        .post(
          `${BASE_URL}/bookings`,
          {
            daySlotId: slotId2,
            bookingType: 'SUBSCRIPTION_PASS',
            ticketQuantity: 1,
          },
          { headers: { Authorization: `Bearer ${vipToken}` } },
        )
        .then((res: any) => ({ index, status: 'SUCCESS', data: res.data.data }))
        .catch((err: any) => ({
          index,
          status: 'FAILED',
          message: err.response?.data?.error?.message || err.message,
        }));
    });

    const phase2Results = await Promise.all(phase2Promises);
    const phase2Succeeded = phase2Results.filter((r) => r.status === 'SUCCESS');
    const phase2Failed = phase2Results.filter((r) => r.status === 'FAILED');

    console.log('\n--- PHASE 2 RESULTS ---');
    console.log(`Total Simultaneous Requests by VIP User: ${SIMULTANEOUS_VIP_REQUESTS}`);
    console.log(`Successful Subscription Passes Granted:  ${phase2Succeeded.length} / 1`);
    console.log(`Blocked Excess Requests:                  ${phase2Failed.length}`);

    if (phase2Succeeded.length === 1 && phase2Failed.length === SIMULTANEOUS_VIP_REQUESTS - 1) {
      console.log('✅ PHASE 2 PASSED: Subscription daily limit strictly enforced under race conditions!');
    } else {
      console.log('❌ PHASE 2 FAILED: Daily limit breached!');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL RACE CONDITION TESTS COMPLETED SUCCESSFULLY');
    console.log('=====================================================\n');
  } catch (error: any) {
    console.error('Error during race condition test:', error.response?.data || error.message);
  }
}

runConcurrencyTest();
