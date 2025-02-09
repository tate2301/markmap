import { Direction } from "../types";
import { CenterLayoutStrategy } from "./CentredStrategy";
import { LRLayoutStrategy, RLLayoutStrategy } from "./HorizontalStrategy";
import { ILayoutStrategy } from "./ILayoutStrategy";
import { BTLayoutStrategy, TBLayoutStrategy } from "./VerticalStrategy";

const strategyCache: Record<Direction, ILayoutStrategy> = {
    [Direction.LR]: new LRLayoutStrategy(),
    [Direction.RL]: new RLLayoutStrategy(),
    [Direction.TB]: new TBLayoutStrategy(),
    [Direction.BT]: new BTLayoutStrategy(),
    [Direction.CENTER]: new CenterLayoutStrategy(),
  };

  function getLayoutStrategy(direction: Direction): ILayoutStrategy {
    return strategyCache[direction] || strategyCache[Direction.LR];
  }

  export {strategyCache, getLayoutStrategy}