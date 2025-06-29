import { AirService } from "@mocanetwork/airkit";

const service = new AirService({
  partnerId: process.env.NEXT_PUBLIC_AIR_PARTNER_ID || "string", // Replace with your actual Partner ID
});

export { service as airService };
export default service; 