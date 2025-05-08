db.createCollection('counters');
db.counters.insertOne({
  _id: 'patientId',
  sequence_value: 0,
});

db.counters.insertOne({
  _id: 'appointmentId',
  sequence_value: 0,
});
