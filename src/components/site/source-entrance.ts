import 'server-only';
import presets from '../../content/motion/presets.generated.json';
import { entranceSchema } from '../../content/motion/schema';
import { entranceAttributes } from './entrance';

export function homeEntrance(id: keyof typeof presets.home) {
  return entranceSchema.parse(presets.home[id]);
}
export function homeEntranceAttributes(id: keyof typeof presets.home) {
  return entranceAttributes(homeEntrance(id));
}
export function footerEntranceAttributes(role: keyof typeof presets.footer) {
  return entranceAttributes(entranceSchema.parse(presets.footer[role]));
}
