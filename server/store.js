import { seedBoats, seedUsers, seedWaitlist } from '../src/data/seed.js';
import { execute, query, withTransaction } from './db.js';

function mapUserRow(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email || '',
    phone: row.phone || '',
    boatId: row.boat_id,
    position: row.position || '',
    membership: row.membership || '',
    category: row.category || '',
    sourceNote: row.source_note || '',
    createdAt: Number(row.created_at),
  };
}

function mapBoatRow(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    registration: row.registration,
    capacity: Number(row.capacity),
    homePort: row.home_port,
    status: row.status,
    captainId: row.captain_id,
    lengthFt: row.length_ft == null ? 0 : Number(row.length_ft),
    createdAt: Number(row.created_at),
  };
}

function mapWaitlistRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    requestedBoatId: row.requested_boat_id,
    assignedBoatId: row.assigned_boat_id,
    partySize: Number(row.party_size || 1),
    note: row.note || '',
    status: row.status,
    requestedAt: Number(row.requested_at),
    decidedBy: row.decided_by,
    decidedAt: row.decided_at == null ? null : Number(row.decided_at),
  };
}

export async function ensureSchema() {
  await execute(`
    CREATE TABLE IF NOT EXISTS sail_users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(32) NOT NULL,
      email VARCHAR(255) NULL,
      phone VARCHAR(32) NULL,
      boat_id VARCHAR(64) NULL,
      position VARCHAR(128) NULL,
      membership VARCHAR(128) NULL,
      category VARCHAR(128) NULL,
      source_note VARCHAR(255) NULL,
      created_at BIGINT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS sail_boats (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(32) NOT NULL,
      registration VARCHAR(64) NOT NULL,
      capacity INT NOT NULL,
      home_port VARCHAR(128) NOT NULL,
      status VARCHAR(32) NOT NULL,
      captain_id VARCHAR(64) NULL,
      length_ft INT NULL,
      created_at BIGINT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS sail_waitlist (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      requested_boat_id VARCHAR(64) NULL,
      assigned_boat_id VARCHAR(64) NULL,
      party_size INT NOT NULL DEFAULT 1,
      note VARCHAR(255) NULL,
      status VARCHAR(32) NOT NULL,
      requested_at BIGINT NOT NULL,
      decided_by VARCHAR(64) NULL,
      decided_at BIGINT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function seedIfEmpty() {
  const usersCount = await query('SELECT COUNT(*) AS count FROM sail_users');
  if (Number(usersCount[0].count) > 0) return;

  await withTransaction(async (conn) => {
    for (const user of seedUsers) {
      await conn.execute(
        `INSERT INTO sail_users
          (id, name, role, email, phone, boat_id, position, membership, category, source_note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.name,
          user.role,
          user.email || null,
          user.phone || null,
          user.boatId || null,
          user.position || null,
          user.membership || null,
          user.category || null,
          user.sourceNote || null,
          Number(user.createdAt || Date.now()),
        ],
      );
    }

    for (const boat of seedBoats) {
      await conn.execute(
        `INSERT INTO sail_boats
          (id, name, type, registration, capacity, home_port, status, captain_id, length_ft, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          boat.id,
          boat.name,
          boat.type,
          boat.registration,
          Number(boat.capacity || 0),
          boat.homePort,
          boat.status,
          boat.captainId || null,
          boat.lengthFt == null ? null : Number(boat.lengthFt),
          Number(boat.createdAt || Date.now()),
        ],
      );
    }

    for (const item of seedWaitlist) {
      await conn.execute(
        `INSERT INTO sail_waitlist
          (id, user_id, requested_boat_id, assigned_boat_id, party_size, note, status, requested_at, decided_by, decided_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.userId,
          item.requestedBoatId || null,
          item.assignedBoatId || null,
          Math.max(1, Math.min(5, Number(item.partySize || 1))),
          item.note || null,
          item.status,
          Number(item.requestedAt || Date.now()),
          item.decidedBy || null,
          item.decidedAt == null ? null : Number(item.decidedAt),
        ],
      );
    }
  });
}

export async function getState() {
  const [usersRows, boatsRows, waitlistRows] = await Promise.all([
    query('SELECT * FROM sail_users ORDER BY created_at ASC'),
    query('SELECT * FROM sail_boats ORDER BY created_at ASC'),
    query('SELECT * FROM sail_waitlist ORDER BY requested_at ASC'),
  ]);

  return {
    users: usersRows.map(mapUserRow),
    boats: boatsRows.map(mapBoatRow),
    waitlist: waitlistRows.map(mapWaitlistRow),
  };
}

export async function upsertUser(user) {
  await execute(
    `INSERT INTO sail_users
      (id, name, role, email, phone, boat_id, position, membership, category, source_note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      role = VALUES(role),
      email = VALUES(email),
      phone = VALUES(phone),
      boat_id = VALUES(boat_id),
      position = VALUES(position),
      membership = VALUES(membership),
      category = VALUES(category),
      source_note = VALUES(source_note)`,
    [
      user.id,
      user.name,
      user.role,
      user.email || null,
      user.phone || null,
      user.boatId || null,
      user.position || null,
      user.membership || null,
      user.category || null,
      user.sourceNote || null,
      Number(user.createdAt || Date.now()),
    ],
  );
}

export async function deleteUser(userId) {
  await execute('DELETE FROM sail_users WHERE id = ?', [userId]);
  await execute('DELETE FROM sail_waitlist WHERE user_id = ?', [userId]);
}

export async function upsertBoat(boat) {
  await execute(
    `INSERT INTO sail_boats
      (id, name, type, registration, capacity, home_port, status, captain_id, length_ft, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      type = VALUES(type),
      registration = VALUES(registration),
      capacity = VALUES(capacity),
      home_port = VALUES(home_port),
      status = VALUES(status),
      captain_id = VALUES(captain_id),
      length_ft = VALUES(length_ft)`,
    [
      boat.id,
      boat.name,
      boat.type,
      boat.registration,
      Number(boat.capacity || 0),
      boat.homePort,
      boat.status,
      boat.captainId || null,
      boat.lengthFt == null ? null : Number(boat.lengthFt),
      Number(boat.createdAt || Date.now()),
    ],
  );
}

export async function deleteBoat(boatId) {
  await execute('DELETE FROM sail_boats WHERE id = ?', [boatId]);
  await execute('UPDATE sail_users SET boat_id = NULL WHERE boat_id = ?', [boatId]);
  await execute('UPDATE sail_waitlist SET requested_boat_id = NULL WHERE requested_boat_id = ?', [boatId]);
}

export async function upsertWaitlist(item) {
  await execute(
    `INSERT INTO sail_waitlist
      (id, user_id, requested_boat_id, assigned_boat_id, party_size, note, status, requested_at, decided_by, decided_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      user_id = VALUES(user_id),
      requested_boat_id = VALUES(requested_boat_id),
      assigned_boat_id = VALUES(assigned_boat_id),
      party_size = VALUES(party_size),
      note = VALUES(note),
      status = VALUES(status),
      requested_at = VALUES(requested_at),
      decided_by = VALUES(decided_by),
      decided_at = VALUES(decided_at)`,
    [
      item.id,
      item.userId,
      item.requestedBoatId || null,
      item.assignedBoatId || null,
      Math.max(1, Math.min(5, Number(item.partySize || 1))),
      item.note || null,
      item.status,
      Number(item.requestedAt || Date.now()),
      item.decidedBy || null,
      item.decidedAt == null ? null : Number(item.decidedAt),
    ],
  );
}

export async function resetToSeed() {
  await withTransaction(async (conn) => {
    await conn.execute('DELETE FROM sail_waitlist');
    await conn.execute('DELETE FROM sail_boats');
    await conn.execute('DELETE FROM sail_users');
  });
  await seedIfEmpty();
}

export async function replaceState(state) {
  const users = Array.isArray(state?.users) ? state.users : [];
  const boats = Array.isArray(state?.boats) ? state.boats : [];
  const waitlist = Array.isArray(state?.waitlist) ? state.waitlist : [];

  await withTransaction(async (conn) => {
    await conn.execute('DELETE FROM sail_waitlist');
    await conn.execute('DELETE FROM sail_boats');
    await conn.execute('DELETE FROM sail_users');

    for (const user of users) {
      await conn.execute(
        `INSERT INTO sail_users
          (id, name, role, email, phone, boat_id, position, membership, category, source_note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.name,
          user.role,
          user.email || null,
          user.phone || null,
          user.boatId || null,
          user.position || null,
          user.membership || null,
          user.category || null,
          user.sourceNote || null,
          Number(user.createdAt || Date.now()),
        ],
      );
    }

    for (const boat of boats) {
      await conn.execute(
        `INSERT INTO sail_boats
          (id, name, type, registration, capacity, home_port, status, captain_id, length_ft, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          boat.id,
          boat.name,
          boat.type,
          boat.registration,
          Number(boat.capacity || 0),
          boat.homePort,
          boat.status,
          boat.captainId || null,
          boat.lengthFt == null ? null : Number(boat.lengthFt),
          Number(boat.createdAt || Date.now()),
        ],
      );
    }

    for (const item of waitlist) {
      await conn.execute(
        `INSERT INTO sail_waitlist
          (id, user_id, requested_boat_id, assigned_boat_id, party_size, note, status, requested_at, decided_by, decided_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.userId,
          item.requestedBoatId || null,
          item.assignedBoatId || null,
          Math.max(1, Math.min(5, Number(item.partySize || 1))),
          item.note || null,
          item.status || 'pending',
          Number(item.requestedAt || Date.now()),
          item.decidedBy || null,
          item.decidedAt == null ? null : Number(item.decidedAt),
        ],
      );
    }
  });
}
