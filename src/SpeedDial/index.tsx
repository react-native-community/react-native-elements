import { withTheme } from '../config';
import { SpeedDial, SpeedDialProps } from './SpeedDial';
import { SpeedDialAction, SpeedDialActionProps } from './SpeedDial.Action';

export { SpeedDial };
export type { SpeedDialProps, SpeedDialActionProps };
export default Object.assign(withTheme(SpeedDial, 'SpeedDial'), {
  Action: SpeedDialAction,
});
