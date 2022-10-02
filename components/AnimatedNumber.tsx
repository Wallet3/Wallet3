/**
 * @author wkh237
 * @version 0.1.1
 * @url https://github.com/wkh237/react-native-animate-number
 */

import React, { Component } from 'react';
import { Text, TextProps } from 'react-native';

const HALF_RAD = Math.PI / 2;

interface IProps extends TextProps {
  countBy?: number;
  interval?: number;
  steps?: number;
  value: number;
  timing: 'linear' | 'easeOut' | 'easeIn';
  formatter: (v: any) => any;

  onFinish?: (total: number, formatted: number) => void;
  onProgress?: (progress: number, total: number) => void;
  startAt?: number;
  initialValue?: number;
}

export default class AnimateNumber extends Component<IProps, any> {
  static defaultProps = {
    interval: 14,
    timing: 'linear',
    steps: 45,
    value: 0,
    initialValue: 0,
    formatter: (val) => val,
    onFinish: () => {},
  };

  static TimingFunctions = {
    linear: (interval: number, progress: number): number => {
      return interval;
    },

    easeOut: (interval: number, progress: number): number => {
      return interval * Math.sin(HALF_RAD * progress) * 5;
    },

    easeIn: (interval: number, progress: number): number => {
      return interval * Math.sin(HALF_RAD - HALF_RAD * progress) * 5;
    },
  };

  state: {
    value: number;
    displayValue?: number;
  };

  /**
   * Animation direction, true means positive, false means negative.
   * @type {boolean}
   */
  direction: boolean = true;
  /**
   * Start value of last animation.
   * @type {number}
   */
  startFrom: number;
  /**
   * End value of last animation.
   * @type {number}
   */
  endWith: number;

  dirty = false;

  constructor(props: IProps) {
    for (let defProp of Object.getOwnPropertyNames(AnimateNumber.defaultProps)) {
      props[defProp] = props[defProp] || AnimateNumber.defaultProps[defProp];
    }

    super(props);

    this.state = {
      value: props.initialValue || 0,
      displayValue: props.formatter(props.initialValue || 0),
    };

    this.dirty = false;
    this.startFrom = 0;
    this.endWith = 0;
  }

  componentDidMount() {
    this.startFrom = this.state.value || 0;
    this.endWith = this.props?.value ?? 0;
    this.dirty = true;
    setTimeout(
      () => {
        this.startAnimate();
      },
      this.props.startAt != null ? this.props.startAt : 0
    );
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    // check if start an animation
    if (this.props.value !== nextProps.value) {
      this.startFrom = this.props.value;
      this.endWith = nextProps.value;
      this.dirty = true;
      this.startAnimate();
      return;
    }
    // Check if iterate animation frame
    if (!this.dirty) {
      return;
    }

    if (this.direction === true) {
      if (parseFloat(this.state.value as any) <= parseFloat(this.props.value as any)) {
        this.startAnimate();
      }
    } else if (this.direction === false) {
      if (parseFloat(this.state.value as any) >= parseFloat(this.props.value as any)) {
        this.startAnimate();
      }
    }
  }

  render() {
    return <Text {...this.props}>{this.state.displayValue}</Text>;
  }

  startAnimate() {
    let progress = this.getAnimationProgress();

    setTimeout(() => {
      let value = (this.endWith - this.startFrom) / (this.props.steps || 45);
      let sign = value >= 0 ? 1 : -1;
      if (this.props.countBy) value = sign * Math.abs(this.props.countBy);
      let total = parseFloat(this.state.value as any) + parseFloat(value as any);

      this.direction = value > 0;
      // animation terminate conditions
      if (((this.direction as any) ^ ((total <= this.endWith) as any)) === 1) {
        this.dirty = false;
        total = this.endWith;
        this.props.onFinish?.(total, this.props.formatter(total));
      }

      this.props.onProgress?.(this.state.value, total);

      this.setState({
        value: total,
        displayValue: this.props.formatter(total),
      });
    }, this.getTimingFunction(this.props.interval || 14, progress));
  }

  getAnimationProgress(): number {
    return (this.state.value - this.startFrom) / (this.endWith - this.startFrom);
  }

  getTimingFunction(interval: number, progress: number) {
    return AnimateNumber.TimingFunctions['linear'](interval, progress);
  }
}
