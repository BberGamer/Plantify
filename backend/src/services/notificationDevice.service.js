const { createHash } = require("node:crypto");
const Device = require("../models/notificationDevice.model");
const AppError = require("../utils/app-error");
const v = require("../validators/common");

const revokeUpdate = () => ({
  $set: { revoked: true, revoked_at: new Date() },
  $unset: { token: 1 },
});
const uuid =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

function credentials(installationId, input) {
  v.object(input);
  const { bindingId, revocationKey, sequence } = input;
  for (const [field, value] of Object.entries({
    installationId,
    bindingId,
    revocationKey,
  })) {
    if (typeof value !== "string" || !uuid.test(value)) v.invalid(field);
  }
  if (!Number.isSafeInteger(sequence) || sequence < 1) v.invalid("sequence");
  return {
    _id: bindingId,
    installation_id: installationId,
    sequence,
    revoke_hash: createHash("sha256").update(revocationKey).digest("hex"),
  };
}

async function register(userId, installationId, input) {
  const identity = credentials(installationId, input);
  const token = v.text(input.token, "token");
  if (token.length > 4096) v.invalid("token");
  await Device.init();
  const session = await Device.startSession();
  try {
    await session.withTransaction(async () => {
      const existing = await Device.findById(identity._id)
        .select("+revoke_hash +token")
        .session(session);
      if (
        existing &&
        (existing.revoked ||
          existing.installation_id !== installationId ||
          existing.sequence !== identity.sequence ||
          String(existing.user_id) !== userId ||
          existing.revoke_hash !== identity.revoke_hash)
      )
        throw new AppError(
          "DEVICE_BINDING_INACTIVE",
          409,
          "Liên kết thiết bị đã hết hiệu lực.",
        );
      if (
        await Device.exists({
          installation_id: installationId,
          sequence: { $gt: identity.sequence },
          user_id: { $exists: true },
        }).session(session)
      )
        throw new AppError(
          "DEVICE_BINDING_INACTIVE",
          409,
          "Liên kết thiết bị đã hết hiệu lực.",
        );
      if (existing?.token === token) return;

      await Device.updateMany(
        {
          _id: { $ne: identity._id },
          revoked: false,
          $or: [{ installation_id: installationId }, { token }],
        },
        revokeUpdate(),
        { session },
      );
      await Device.updateOne(
        identity,
        { $set: { user_id: userId, token, revoked: false } },
        { upsert: true, session },
      );
    });
  } finally {
    await session.endSession();
  }
  return { bindingId: identity._id };
}

async function revoke(installationId, input) {
  const identity = credentials(installationId, input);
  await Device.init();
  // A tombstone also handles a registration still in flight at logout.
  try {
    await Device.updateOne(identity, revokeUpdate(), { upsert: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
    await Device.updateOne(identity, revokeUpdate());
  }
  return { revoked: true };
}

module.exports = { register, revoke };
