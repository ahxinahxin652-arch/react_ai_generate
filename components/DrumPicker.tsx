import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DrumPickerProps<T> {
  items: T[];
  selectedItem: T;
  onSelect: (item: T) => void;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  itemHeight?: number;
  visibleItems?: number;
  className?: string;
}

function DrumPicker<T extends { id: string }>({
  items,
  selectedItem,
  onSelect,
  renderItem,
  itemHeight = 80,
  visibleItems = 5,
  className = '',
}: DrumPickerProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  // @ts-ignore
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const selectedIndex = items.findIndex(item => item.id === selectedItem.id);
  const containerHeight = itemHeight * visibleItems;
  const paddingHeight = (containerHeight - itemHeight) / 2;

  // 计算目标滚动位置
  const getTargetScrollTop = useCallback((index: number) => {
    return index * itemHeight;
  }, [itemHeight]);

  // 初始化滚动位置
  useEffect(() => {
    if (selectedIndex >= 0) {
      setScrollTop(getTargetScrollTop(selectedIndex));
    }
  }, [selectedIndex, getTargetScrollTop]);

  // 惯性滚动动画
  const animateScroll = useCallback((currentVelocity: number) => {
    if (Math.abs(currentVelocity) < 0.1) {
      setIsAnimating(false);
      // 吸附到最近项
      const currentIndex = Math.round(scrollTop / itemHeight);
      const targetIndex = Math.max(0, Math.min(items.length - 1, currentIndex));
      setScrollTop(getTargetScrollTop(targetIndex));
      onSelect(items[targetIndex]);
      return;
    }

    setIsAnimating(true);
    const newScrollTop = scrollTop + currentVelocity;
    const clampedScrollTop = Math.max(
      -paddingHeight,
      Math.min((items.length - 1) * itemHeight + paddingHeight, newScrollTop)
    );

    setScrollTop(clampedScrollTop);
    setVelocity(currentVelocity * 0.95); // 摩擦力

    rafRef.current = requestAnimationFrame(() => animateScroll(currentVelocity * 0.95));
  }, [scrollTop, itemHeight, paddingHeight, items.length, onSelect, items]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // 处理滚动结束，吸附到最近项
  useEffect(() => {
    if (!isDragging && !isAnimating && scrollTop !== getTargetScrollTop(selectedIndex)) {
      const currentIndex = Math.round(scrollTop / itemHeight);
      const targetIndex = Math.max(0, Math.min(items.length - 1, currentIndex));
      setScrollTop(getTargetScrollTop(targetIndex));
      if (targetIndex !== selectedIndex) {
        onSelect(items[targetIndex]);
      }
    }
  }, [isDragging, isAnimating, scrollTop, itemHeight, items, selectedIndex, getTargetScrollTop, onSelect]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartScrollTop(scrollTop);
    setLastY(e.clientY);
    setVelocity(0);
    lastTimeRef.current = performance.now();
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;
    const newScrollTop = startScrollTop + deltaY;
    const clampedScrollTop = Math.max(
      -paddingHeight,
      Math.min((items.length - 1) * itemHeight + paddingHeight, newScrollTop)
    );

    setScrollTop(clampedScrollTop);

    // 计算速度
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimeRef.current;
    const deltaYVelocity = lastY - e.clientY;

    if (deltaTime > 0) {
      setVelocity(deltaYVelocity / deltaTime * 16);
    }

    setLastY(e.clientY);
    lastTimeRef.current = currentTime;
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // 启动惯性滚动
      if (Math.abs(velocity) > 0.5) {
        animateScroll(velocity);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // 移除 preventDefault() 以避免 passive event listener 警告
    // 滚动行为由我们自己控制，不需要阻止默认行为
    const delta = e.deltaY;
    const newScrollTop = scrollTop + delta;
    const clampedScrollTop = Math.max(
      -paddingHeight,
      Math.min((items.length - 1) * itemHeight + paddingHeight, newScrollTop)
    );
    setScrollTop(clampedScrollTop);
  };

  const handleClick = (item: T, index: number) => {
    onSelect(item);
    setScrollTop(getTargetScrollTop(index));
  };

  return (
    <div className={`drum-picker ${className}`}>
      <div
        ref={containerRef}
        className="drum-picker-container relative h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* 顶部渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: `${paddingHeight}px`,
          background: 'linear-gradient(to bottom, rgba(15, 17, 19, 1) 0%, rgba(15, 17, 19, 0) 100%)'
        }} />

        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: `${paddingHeight}px`,
          background: 'linear-gradient(to top, rgba(15, 17, 19, 1) 0%, rgba(15, 17, 19, 0) 100%)'
        }} />

        {/* 中间选中指示器 - 科技感光晕 */}
        <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{
          top: `${paddingHeight}px`,
          height: `${itemHeight}px`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent" />
        </div>

        {/* 项目列表 */}
        <div
          className="drum-picker-items"
          style={{
            transform: `translateY(${-scrollTop + paddingHeight}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {items.map((item, index) => {
            const itemTop = index * itemHeight;
            const distanceFromCenter = Math.abs((scrollTop - itemTop) / itemHeight);
            const isSelected = item.id === selectedItem.id;

            // 计算透明度和缩放
            const opacity = Math.max(0.3, 1 - distanceFromCenter * 0.4);
            const scale = isSelected ? 1.05 : Math.max(0.9, 1 - distanceFromCenter * 0.1);

            return (
              <div
                key={item.id}
                className="drum-picker-item absolute left-0 right-0 flex items-center justify-center"
                style={{
                  top: `${itemTop}px`,
                  height: `${itemHeight}px`,
                  opacity,
                  transform: `scale(${scale})`,
                  transition: isDragging ? 'none' : 'all 0.2s ease-out',
                  cursor: 'pointer'
                }}
                onClick={() => handleClick(item, index)}
              >
                {renderItem(item, isSelected)}
              </div>
            );
          })}
        </div>

        {/* 顶部和底部填充，保持滚动 */}
        <div style={{ height: `${paddingHeight}px` }} />
        <div style={{ height: `${paddingHeight}px` }} />
      </div>
    </div>
  );
}

export default DrumPicker;
