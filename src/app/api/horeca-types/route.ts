import { masterController } from "@/features/master/master.controller";

export async function GET() {
  return masterController.listHorecaTypes();
}
