import React, { useState, useEffect, useRef } from 'react';

// --- Assets & Constants ---
const ICONS = {
  computer: "https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png",
  folder: "https://win98icons.alexmeub.com/icons/png/directory_open-4.png",
  text: "https://win98icons.alexmeub.com/icons/png/notepad-4.png",
  settings: "https://win98icons.alexmeub.com/icons/png/settings_gear-4.png",
  window: "https://win98icons.alexmeub.com/icons/png/application_hourglass-4.png",
  trash: "https://win98icons.alexmeub.com/icons/png/recycle_bin_empty-4.png",
  html: "https://win98icons.alexmeub.com/icons/png/html-4.png",
  paint: "https://win98icons.alexmeub.com/icons/png/paint-4.png",
  console: "https://win98icons.alexmeub.com/icons/png/console_prompt-0.png",
  tree: "https://win98icons.alexmeub.com/icons/png/network_neighborhood-4.png",
  msgbox: "https://win98icons.alexmeub.com/icons/png/msg_warning-0.png",
  installer: "https://win98icons.alexmeub.com/icons/png/installer-0.png",
  cd: "https://win98icons.alexmeub.com/icons/png/cd_audio_cd_a-4.png",
  printer: "https://win98icons.alexmeub.com/icons/png/print_server-4.png",
  internet: "https://win98icons.alexmeub.com/icons/png/msie1-4.png",
  mail: "https://win98icons.alexmeub.com/icons/png/outlook_express-4.png",
  media: "https://win98icons.alexmeub.com/icons/png/windows_media_player-4.png",
  help: "https://win98icons.alexmeub.com/icons/png/help_book_small-4.png",
  find: "https://win98icons.alexmeub.com/icons/png/search_file-4.png",
  shut: "https://win98icons.alexmeub.com/icons/png/shut_down_cool-4.png",
};

const DEFAULT_WINDOW_ICON = ICONS.computer;
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  // --- State ---
  const [widgets, setWidgets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [windowTitle, setWindowTitle] = useState("我的应用程序");
  const [windowIcon, setWindowIcon] = useState(DEFAULT_WINDOW_ICON);
  const [activeTab, setActiveTab] = useState('props'); 
  const [copyFeedback, setCopyFeedback] = useState("");
  
  // Modes
  const [isRunMode, setIsRunMode] = useState(false); 

  // Grid & Layout Settings
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(8);
  const [canvasRect, setCanvasRect] = useState({ width: 600, height: 450 });

  // Interactions
  const [isDraggingWidget, setIsDraggingWidget] = useState(false);
  const [isResizingWidget, setIsResizingWidget] = useState(false);
  const [isResizingWindow, setIsResizingWindow] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  
  // Drag Offsets / Initial Rects
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialRect, setInitialRect] = useState(null); 

  const canvasRef = useRef(null); 

  // --- Helpers ---
  const snap = (value) => (!isRunMode && showGrid) ? Math.round(value / gridSize) * gridSize : value;

  // --- Actions ---
  const addWidget = (type, dropX = 20, dropY = 20) => {
    const defaultSize = getDefaultSize(type);
    const newWidget = {
      id: generateId(),
      type,
      x: snap(dropX),
      y: snap(dropY),
      width: defaultSize.width,
      height: defaultSize.height,
      props: getDefaultProps(type),
      zIndex: widgets.length + 1,
    };
    setWidgets(prev => [...prev, newWidget]);
    setSelectedId(newWidget.id);
  };

  const removeWidget = (id) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateWidgetProps = (id, key, value) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, props: { ...w.props, [key]: value } } : w
    ));
  };

  // --- Data Definitions ---
  const getComponentName = (type) => {
    const map = {
      button: '按钮 (Button)',
      text: '单行输入 (Input)',
      textarea: '多行文本 (Textarea)',
      checkbox: '复选框 (Checkbox)',
      radio: '单选框 (Radio)',
      dropdown: '下拉菜单 (Dropdown)',
      listbox: '列表框 (Listbox)',
      slider: '滑动条 (Slider)',
      progressbar: '进度条 (Progress)',
      image: '图片 (Image)',
      paragraph: '文字标签 (Label)',
      groupbox: '分组框 (GroupBox)',
      tabs: '标签页 (Tabs)',
      treeview: '树形图 (Tree)',
      statusbar: '状态栏 (Status)',
      hscrollbar: '水平滚动条 (HScroll)',
      vscrollbar: '垂直滚动条 (VScroll)',
      scrollbtn: '滚动按钮 (Btn)',
    };
    return map[type] || type;
  };

  const getComponentDesc = (type) => {
    const map = {
      button: '标准点击按钮，支持图标和文字',
      text: '单行文本输入框',
      textarea: '多行文本编辑区域',
      checkbox: '复选框，支持选中状态',
      radio: '单选按钮，同一组互斥',
      dropdown: '下拉选择菜单',
      listbox: '列表展示框',
      slider: '滑动条控件',
      progressbar: '显示进度的条形控件',
      image: '显示一张图片',
      paragraph: '纯文本展示标签',
      groupbox: '用于分组的边框容器',
      tabs: '选项卡切换控件',
      treeview: '树形目录结构',
      statusbar: '底部状态栏',
      hscrollbar: '水平方向滚动条',
      vscrollbar: '垂直方向滚动条',
      scrollbtn: '带有箭头的微调按钮',
    };
    return map[type] || '组件';
  };

  const getDefaultSize = (type) => {
    switch (type) {
      case 'button': return { width: 80, height: 24 };
      case 'text': return { width: 120, height: 24 };
      case 'textarea': return { width: 200, height: 100 };
      case 'checkbox': return { width: 120, height: 24 };
      case 'radio': return { width: 120, height: 24 };
      case 'dropdown': return { width: 120, height: 24 };
      case 'listbox': return { width: 120, height: 100 };
      case 'slider': return { width: 120, height: 30 };
      case 'progressbar': return { width: 150, height: 20 };
      case 'image': return { width: 64, height: 64 };
      case 'paragraph': return { width: 100, height: 24 };
      case 'groupbox': return { width: 200, height: 150 };
      case 'tabs': return { width: 250, height: 150 };
      case 'treeview': return { width: 150, height: 200 };
      case 'statusbar': return { width: 300, height: 24 };
      case 'hscrollbar': return { width: 150, height: 16 };
      case 'vscrollbar': return { width: 16, height: 150 };
      case 'scrollbtn': return { width: 16, height: 16 };
      default: return { width: 100, height: 50 };
    }
  };

  const getDefaultProps = (type) => {
    switch (type) {
      case 'button': return { label: '确 定', textAlign: 'center', iconSrc: '', iconW: 16, iconH: 16, disabled: false };
      case 'text': return { value: '', placeholder: '' };
      case 'textarea': return { value: '这里是多行文本内容...' };
      case 'checkbox': return { label: '选项', checked: false, disabled: false };
      case 'radio': return { label: '单选', name: 'radio-grp', checked: false };
      case 'dropdown': return { options: '选项A,选项B,选项C' };
      case 'listbox': return { options: '项目1,项目2,项目3' };
      case 'slider': return { min: 0, max: 10, value: 0 };
      case 'progressbar': return { value: 50, max: 100 };
      case 'image': return { src: 'https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png' };
      case 'paragraph': return { text: '文本标签' };
      case 'groupbox': return { label: '分组标题' };
      case 'tabs': return { tabs: '常规,高级,设置', activeIndex: 0 };
      case 'treeview': return { data: 'C:/\n  Documents\n  Program Files' };
      case 'statusbar': return { text: '就绪' };
      case 'hscrollbar': return { value: 0 };
      case 'vscrollbar': return { value: 0 };
      case 'scrollbtn': return { direction: 'up' }; // up, down, left, right
      default: return {};
    }
  };

  // --- Drag & Drop ---
  const handleDragStartTool = (e, type) => {
    e.dataTransfer.setData('widgetType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropCanvas = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRunMode) return;
    const type = e.dataTransfer.getData('widgetType');
    if (type && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addWidget(type, x, y);
    }
  };

  const handleDragOverCanvas = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // --- Interactions ---
  const handleMouseDownWidget = (e, id) => {
    if (isRunMode) return; 
    e.stopPropagation();
    setSelectedId(id);
    setIsDraggingWidget(true);
    const widget = widgets.find(w => w.id === id);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) - widget.x,
      y: (e.clientY - rect.top) - widget.y
    });
  };

  const handleMouseDownResizeWidget = (e, id, handle) => {
    if (isRunMode) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(id);
    setIsResizingWidget(true);
    setResizeHandle(handle);
    const widget = widgets.find(w => w.id === id);
    setInitialRect({ 
      x: widget.x, y: widget.y, w: widget.width, h: widget.height, 
      mouseX: e.clientX, mouseY: e.clientY 
    });
  };

  const handleMouseDownResizeWindow = (e, handle) => {
    if (isRunMode) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizingWindow(true);
    setResizeHandle(handle);
    setInitialRect({
      w: canvasRect.width, h: canvasRect.height,
      mouseX: e.clientX, mouseY: e.clientY
    });
  };

  useEffect(() => {
    const handleGlobalMove = (e) => {
      if (isRunMode) return;

      if (isDraggingWidget && selectedId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - dragOffset.x;
        const y = e.clientY - rect.top - dragOffset.y;
        setWidgets(prev => prev.map(w => w.id === selectedId ? { ...w, x: snap(x), y: snap(y) } : w));
      } else if (isResizingWidget && selectedId && initialRect) {
        const dx = e.clientX - initialRect.mouseX;
        const dy = e.clientY - initialRect.mouseY;
        setWidgets(prev => prev.map(w => {
          if (w.id !== selectedId) return w;
          let { x, y, w: width, h: height } = initialRect;
          let newW = width, newH = height, newX = x, newY = y;

          if (resizeHandle.includes('e')) newW = width + dx;
          if (resizeHandle.includes('s')) newH = height + dy;
          if (resizeHandle.includes('w')) { newW = width - dx; newX = x + dx; }
          if (resizeHandle.includes('n')) { newH = height - dy; newY = y + dy; }

          if (showGrid) {
            if (resizeHandle.includes('e') || resizeHandle.includes('w')) newW = Math.round(newW / gridSize) * gridSize;
            if (resizeHandle.includes('s') || resizeHandle.includes('n')) newH = Math.round(newH / gridSize) * gridSize;
            if (resizeHandle.includes('w')) newX = Math.round(newX / gridSize) * gridSize;
            if (resizeHandle.includes('n')) newY = Math.round(newY / gridSize) * gridSize;
          }

          return { ...w, x: newX, y: newY, width: Math.max(10, newW), height: Math.max(10, newH) };
        }));
      } else if (isResizingWindow && initialRect) {
        const dx = e.clientX - initialRect.mouseX;
        const dy = e.clientY - initialRect.mouseY;
        let newW = initialRect.w, newH = initialRect.h;

        if (resizeHandle.includes('e')) newW += dx;
        if (resizeHandle.includes('s')) newH += dy;
        if (resizeHandle.includes('w')) newW -= dx;
        if (resizeHandle.includes('n')) newH -= dy;

        setCanvasRect({ 
          width: Math.max(100, newW), 
          height: Math.max(50, newH) 
        });
      }
    };

    const handleGlobalUp = () => {
      setIsDraggingWidget(false);
      setIsResizingWidget(false);
      setIsResizingWindow(false);
      setResizeHandle(null);
    };

    if (isDraggingWidget || isResizingWidget || isResizingWindow) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [isDraggingWidget, isResizingWidget, isResizingWindow, dragOffset, initialRect, resizeHandle, showGrid, gridSize, selectedId, isRunMode]);

  // --- File Upload ---
  const handleIconUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- Code Generation ---
  const generateHTML = () => {
    const sortedWidgets = [...widgets].sort((a,b) => a.zIndex - b.zIndex);
    const widgetsHTML = sortedWidgets.map(w => {
      const stylePos = `position: absolute; left: ${w.x}px; top: ${w.y}px; width: ${w.width}px; height: ${w.height}px; box-sizing: border-box;`;
      const commonProps = `id="${w.id}"${w.props.disabled ? ' disabled' : ''}`;
      
      let content = '';
      switch(w.type) {
        case 'button':
          const btnStyle = `display: flex; align-items: center; justify-content: ${
            w.props.textAlign === 'left' ? 'flex-start' : w.props.textAlign === 'right' ? 'flex-end' : 'center'
          }; padding: 2px; gap: 4px;`;
          const iconImg = w.props.iconSrc ? `<img src="${w.props.iconSrc}" style="width:${w.props.iconW}px;height:${w.props.iconH}px;">` : '';
          content = `<button style="width:100%;height:100%;${btnStyle}" ${commonProps}>${iconImg}<span>${w.props.label}</span></button>`;
          break;
        case 'text': content = `<input type="text" value="${w.props.value}" placeholder="${w.props.placeholder}" style="width:100%;height:100%;" ${commonProps}>`; break;
        case 'textarea': content = `<textarea style="width:100%;height:100%;resize:none;" ${commonProps}>${w.props.value}</textarea>`; break;
        case 'checkbox': content = `<div class="field-row"><input type="checkbox" id="chk-${w.id}" ${w.props.checked ? 'checked' : ''} ${commonProps}><label for="chk-${w.id}">${w.props.label}</label></div>`; break;
        case 'radio': content = `<div class="field-row"><input type="radio" name="${w.props.name}" id="rad-${w.id}" ${w.props.checked ? 'checked' : ''} ${commonProps}><label for="rad-${w.id}">${w.props.label}</label></div>`; break;
        case 'dropdown': content = `<select style="width:100%;height:100%;" ${commonProps}>${w.props.options.split(',').map(o=>`<option>${o}</option>`).join('')}</select>`; break;
        case 'listbox': content = `<select size="5" style="width:100%;height:100%;" ${commonProps}>${w.props.options.split(',').map(o=>`<option>${o}</option>`).join('')}</select>`; break;
        case 'slider': content = `<input type="range" min="${w.props.min}" max="${w.props.max}" value="${w.props.value}" style="width:100%;" ${commonProps}>`; break;
        case 'progressbar': content = `<div class="progress-indicator" style="width:100%;height:100%;border:1px solid white;box-shadow:inset -1px -1px #fff, inset 1px 1px grey;background:#c0c0c0;position:relative;"><div style="background:navy;height:100%;width:${(w.props.value/w.props.max)*100}%;"></div></div>`; break;
        case 'groupbox': content = `<fieldset style="width:100%;height:100%;margin:0;box-sizing:border-box;"><legend>${w.props.label}</legend></fieldset>`; break;
        case 'statusbar': content = `<div class="status-bar" style="width:100%;height:100%;"><p class="status-bar-field">${w.props.text}</p></div>`; break;
        case 'tabs':
           const tabs = w.props.tabs.split(',');
           const tabHeaders = tabs.map((t, i) => `<li role="tab" ${i===0?'aria-selected="true"':''}><a href="#tabs">${t}</a></li>`).join('\n');
           content = `<div style="width:100%;height:100%;display:flex;flex-direction:column;"><menu role="tablist" style="margin:0;">${tabHeaders}</menu><div class="window" role="tabpanel" style="flex:1;margin:0;"></div></div>`;
           break;
        case 'image': content = `<img src="${w.props.src}" style="width:100%;height:100%;object-fit:cover;">`; break;
        case 'treeview': content = `<ul class="tree-view" style="width:100%;height:100%;background:white;border:2px inset;overflow:auto;"><li>${w.props.data}</li></ul>`; break;
        case 'hscrollbar': content = `<div style="width:100%;height:100%;background:#dfdfdf;border:1px solid white;box-shadow:inset 1px 1px #808080;display:flex;flex-direction:row;align-items:center;justify-content:space-between;"><button class="button" style="width:16px;height:100%;min-width:16px;padding:0;">◄</button><div style="flex:1;height:100%;background:#dfdfdf;position:relative;"><div style="width:20px;height:100%;background:#c0c0c0;border:2px outset #fff;position:absolute;left:0;"></div></div><button class="button" style="width:16px;height:100%;min-width:16px;padding:0;">►</button></div>`; break;
        case 'vscrollbar': content = `<div style="width:100%;height:100%;background:#dfdfdf;border:1px solid white;box-shadow:inset 1px 1px #808080;display:flex;flex-direction:column;align-items:center;justify-content:space-between;"><button class="button" style="width:100%;height:16px;min-height:16px;padding:0;">▲</button><div style="flex:1;width:100%;background:#dfdfdf;position:relative;"><div style="height:20px;width:100%;background:#c0c0c0;border:2px outset #fff;position:absolute;top:0;"></div></div><button class="button" style="width:100%;height:16px;min-height:16px;padding:0;">▼</button></div>`; break;
        case 'scrollbtn':
           const arrow = w.props.direction === 'up' ? '▲' : w.props.direction === 'down' ? '▼' : w.props.direction === 'left' ? '◄' : '►';
           content = `<button style="width:100%;height:100%;padding:0;font-size:10px;">${arrow}</button>`; break;
        default: content = `<div>${w.props.label || w.props.text || ''}</div>`;
      }
      return `<div style="${stylePos}">${content}</div>`;
    }).join('\n');

    const iconSrc = windowIcon.length > 5000 ? windowIcon : windowIcon;
    return `<div class="window" style="width:${canvasRect.width}px;height:${canvasRect.height}px;position:relative;">
  <div class="title-bar">
    <div class="title-bar-text" style="display:flex;align-items:center;">
      <img src="${iconSrc}" style="width:16px;height:16px;margin-right:4px;">${windowTitle}
    </div>
    <div class="title-bar-controls">
      <button aria-label="Minimize"></button><button aria-label="Maximize"></button><button aria-label="Close"></button>
    </div>
  </div>
  <div class="window-body" style="position:relative;height:calc(100% - 28px);overflow:hidden;">
${widgetsHTML.split('\n').map(l=>'    '+l).join('\n')}
  </div>
</div>`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateHTML());
    setCopyFeedback("复制成功!");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#008080] overflow-hidden font-sans text-[12px]">
      <style>{`
        @import url("https://unpkg.com/98.css");
        /* 核心修复：强制所有标题栏文字使用 Flexbox 进行垂直居中对齐 */
        .title-bar-text {
          display: flex !important;
          align-items: center !important;
          gap: 4px;
        }
        
        .app-container {
          display: grid;
          grid-template-columns: 180px 1fr 260px; 
          gap: 12px;
          padding: 12px;
          height: 100%;
          box-sizing: border-box;
        }
        .full-height-window { display: flex; flex-direction: column; height: 100%; }
        .window-content-scroll { flex: 1; overflow-y: auto; padding: 6px; background: #c0c0c0; }
        .canvas-area { overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; height: 100%; width: 100%; }
        .grid-bg { background-size: ${gridSize}px ${gridSize}px; background-image: linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px); }
        .widget-box { position: absolute; box-sizing: border-box; user-select: none; }
        .widget-box.editable { cursor: move; }
        .widget-box.editable.selected { outline: 1px dotted black; box-shadow: 0 0 0 1px white; z-index: 9999 !important; }
        .tool-item { display: flex; align-items: center; gap: 6px; padding: 4px; cursor: grab; border: 1px solid transparent; }
        .tool-item:hover { border: 1px outset #fff; background: #eee; }
        .tool-item:active { border: 1px inset #fff; cursor: grabbing; }
        .win-scrollbar { background: #dfdfdf; border: 1px solid white; box-shadow: inset 1px 1px #808080; display: flex; justify-content: space-between; }
        .win-scrollbar-btn { background: #c0c0c0; border: 1px outset #fff; display: flex; align-items: center; justify-content: center; font-size: 8px; cursor: pointer; }
        .win-scrollbar-btn:active { border: 1px inset #fff; }
        .win-thumb { background: #c0c0c0; border: 1px outset #fff; position: relative; }
        .resize-handle { position: absolute; width: 6px; height: 6px; background: white; border: 1px solid black; z-index: 10000; }
        .rh-nw { top:-3px; left:-3px; cursor: nw-resize; }
        .rh-n  { top:-3px; left:50%; transform:translateX(-50%); cursor: n-resize; }
        .rh-ne { top:-3px; right:-3px; cursor: ne-resize; }
        .rh-e  { top:50%; right:-3px; transform:translateY(-50%); cursor: e-resize; }
        .rh-se { bottom:-3px; right:-3px; cursor: se-resize; }
        .rh-s  { bottom:-3px; left:50%; transform:translateX(-50%); cursor: s-resize; }
        .rh-sw { bottom:-3px; left:-3px; cursor: sw-resize; }
        .rh-w  { top:50%; left:-3px; transform:translateY(-50%); cursor: w-resize; }
        .win-resize-handle { position: absolute; background: transparent; z-index: 50; }
        .wr-e { top:0; right:-5px; width:10px; height:100%; cursor:e-resize; }
        .wr-s { bottom:-5px; left:0; width:100%; height:10px; cursor:s-resize; }
        .wr-se { bottom:-5px; right:-5px; width:15px; height:15px; cursor:se-resize; }
        .wr-w { top:0; left:-5px; width:10px; height:100%; cursor:w-resize; }
        .wr-n { top:-5px; left:0; width:100%; height:10px; cursor:n-resize; }
        .wr-nw { top:-5px; left:-5px; width:15px; height:15px; cursor:nw-resize; }
        .wr-ne { top:-5px; right:-5px; width:15px; height:15px; cursor:ne-resize; }
        .wr-sw { bottom:-5px; left:-5px; width:15px; height:15px; cursor:sw-resize; }
        @media (max-width: 800px) { .app-container { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; } }
      `}</style>

      <div className="app-container">
        {/* --- LEFT: Toolbox --- */}
        <div className="window full-height-window">
          <div className="title-bar">
            <div className="title-bar-text">
              <img src={ICONS.computer} alt="" style={{width:16, height:16}} />
              <span>组件箱</span>
            </div>
          </div>
          <div className="window-body window-content-scroll">
            <div className="mb-2 text-gray-600 bg-yellow-100 border border-yellow-500 p-1 text-xs">
              {isRunMode ? "运行模式禁用添加" : "拖拽组件到画布"}
            </div>
            <fieldset className={isRunMode ? 'opacity-50 pointer-events-none' : ''}>
              <legend>标准控件</legend>
              <ToolItem type="button" icon={ICONS.settings} label="按钮 (Button)" onDragStart={handleDragStartTool} desc={getComponentDesc('button')} />
              <ToolItem type="text" icon={ICONS.text} label="输入框 (Input)" onDragStart={handleDragStartTool} desc={getComponentDesc('text')} />
              <ToolItem type="textarea" icon={ICONS.text} label="多行文本 (Area)" onDragStart={handleDragStartTool} desc={getComponentDesc('textarea')} />
              <ToolItem type="checkbox" icon={ICONS.settings} label="复选框 (Check)" onDragStart={handleDragStartTool} desc={getComponentDesc('checkbox')} />
              <ToolItem type="radio" icon={ICONS.settings} label="单选框 (Radio)" onDragStart={handleDragStartTool} desc={getComponentDesc('radio')} />
              <ToolItem type="dropdown" icon={ICONS.folder} label="下拉框 (Select)" onDragStart={handleDragStartTool} desc={getComponentDesc('dropdown')} />
              <ToolItem type="listbox" icon={ICONS.folder} label="列表框 (List)" onDragStart={handleDragStartTool} desc={getComponentDesc('listbox')} />
            </fieldset>
            <fieldset className={`mt-2 ${isRunMode ? 'opacity-50 pointer-events-none' : ''}`}>
              <legend>高级 & 滚动</legend>
              <ToolItem type="slider" icon={ICONS.paint} label="滑块 (Slider)" onDragStart={handleDragStartTool} desc={getComponentDesc('slider')} />
              <ToolItem type="progressbar" icon={ICONS.installer} label="进度条 (Progress)" onDragStart={handleDragStartTool} desc={getComponentDesc('progressbar')} />
              <ToolItem type="hscrollbar" icon={ICONS.settings} label="水平滚动 (HScroll)" onDragStart={handleDragStartTool} desc={getComponentDesc('hscrollbar')} />
              <ToolItem type="vscrollbar" icon={ICONS.settings} label="垂直滚动 (VScroll)" onDragStart={handleDragStartTool} desc={getComponentDesc('vscrollbar')} />
              <ToolItem type="scrollbtn" icon={ICONS.settings} label="滚动按钮 (Btn)" onDragStart={handleDragStartTool} desc={getComponentDesc('scrollbtn')} />
            </fieldset>
            <fieldset className={`mt-2 ${isRunMode ? 'opacity-50 pointer-events-none' : ''}`}>
              <legend>容器 & 装饰</legend>
              <ToolItem type="paragraph" icon={ICONS.html} label="标签 (Label)" onDragStart={handleDragStartTool} desc={getComponentDesc('paragraph')} />
              <ToolItem type="image" icon={ICONS.paint} label="图片 (Image)" onDragStart={handleDragStartTool} desc={getComponentDesc('image')} />
              <ToolItem type="groupbox" icon={ICONS.window} label="分组框 (Group)" onDragStart={handleDragStartTool} desc={getComponentDesc('groupbox')} />
              <ToolItem type="tabs" icon={ICONS.window} label="标签页 (Tabs)" onDragStart={handleDragStartTool} desc={getComponentDesc('tabs')} />
              <ToolItem type="treeview" icon={ICONS.tree} label="树形图 (Tree)" onDragStart={handleDragStartTool} desc={getComponentDesc('treeview')} />
              <ToolItem type="statusbar" icon={ICONS.console} label="状态栏 (Status)" onDragStart={handleDragStartTool} desc={getComponentDesc('statusbar')} />
            </fieldset>
          </div>
        </div>

        {/* --- CENTER: Canvas --- */}
        <div className="canvas-area" onClick={() => !isRunMode && setSelectedId(null)} onDragOver={handleDragOverCanvas} onDrop={handleDropCanvas}>
          <div className="window" style={{ width: canvasRect.width, height: canvasRect.height, position: 'relative', boxShadow: '4px 4px 10px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            {!isRunMode && (
              <>
                <div className="win-resize-handle wr-e" onMouseDown={e=>handleMouseDownResizeWindow(e, 'e')} />
                <div className="win-resize-handle wr-s" onMouseDown={e=>handleMouseDownResizeWindow(e, 's')} />
                <div className="win-resize-handle wr-se" onMouseDown={e=>handleMouseDownResizeWindow(e, 'se')} />
                <div className="win-resize-handle wr-w" onMouseDown={e=>handleMouseDownResizeWindow(e, 'w')} />
                <div className="win-resize-handle wr-n" onMouseDown={e=>handleMouseDownResizeWindow(e, 'n')} />
                <div className="win-resize-handle wr-nw" onMouseDown={e=>handleMouseDownResizeWindow(e, 'nw')} />
                <div className="win-resize-handle wr-ne" onMouseDown={e=>handleMouseDownResizeWindow(e, 'ne')} />
                <div className="win-resize-handle wr-sw" onMouseDown={e=>handleMouseDownResizeWindow(e, 'sw')} />
              </>
            )}
            <div className="title-bar">
              <div className="title-bar-text">
                <img src={windowIcon} style={{width:16, height:16, imageRendering: 'pixelated'}} alt=""/>
                <span>{windowTitle}</span>
              </div>
              <div className="title-bar-controls">
                <button aria-label="Minimize"></button><button aria-label="Maximize"></button><button aria-label="Close"></button>
              </div>
            </div>
            <div ref={canvasRef} className={`window-body ${(!isRunMode && showGrid) ? 'grid-bg' : ''}`} style={{ height: 'calc(100% - 28px)', position: 'relative', overflow: 'hidden', margin: 0 }}>
              {widgets.map(w => (
                <div key={w.id} className={`widget-box ${!isRunMode ? 'editable' : ''} ${selectedId === w.id ? 'selected' : ''}`} style={{ left: w.x, top: w.y, width: w.width, height: w.height, zIndex: w.zIndex }} onMouseDown={(e) => handleMouseDownWidget(e, w.id)}>
                  <div className="w-full h-full overflow-hidden" style={{pointerEvents: isRunMode ? 'auto' : 'none'}}>
                    <WidgetRenderer widget={w} isRunMode={isRunMode} />
                  </div>
                  {!isRunMode && selectedId === w.id && (
                    <>
                      <div className="resize-handle rh-nw" onMouseDown={e=>handleMouseDownResizeWidget(e, w.id, 'nw')} />
                      <div className="resize-handle rh-n" onMouseDown={e=>handleMouseDownResizeWidget(e, w.id, 'n')} />
                      <div className="resize-handle rh-ne" onMouseDown={e=>handleMouseDownResizeWidget(e, w.id, 'ne')} />
                      <div className="resize-handle rh-e" onMouseDown={e=>handleMouseDownResizeWidget(e, w.id, 'e')} />
                      <div className="resize-handle rh-se" onMouseDown={e=>handleMouseDownResizeWidget(e, w.id, 'se')} />
                      <div className="resize-handle rh-s" onMouseDown={e=>handleMouseDownResizeWidget(e, w.id, 's')} />
                      <div className="resize-handle rh-sw" onMouseDown={e=>handleMouseDownResizeWidget(e, w.id, 'sw')} />
                      <div className="resize-handle rh-w" onMouseDown={e=>handleMouseDownResizeWidget(e, w.id, 'w')} />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT: Props & Code --- */}
        <div className="window full-height-window">
          <div className="title-bar">
            <div className="title-bar-text">
              <img src={ICONS.text} alt="" style={{width:16, height:16}} />
              <span>属性与代码</span>
            </div>
          </div>
          <div className="window-body window-content-scroll flex flex-col">
            <div className="field-row mb-2">
                <input type="checkbox" id="run-mode" checked={isRunMode} onChange={e => { setIsRunMode(e.target.checked); setSelectedId(null); }} />
                <label htmlFor="run-mode" className="font-bold text-blue-800 cursor-pointer">{isRunMode ? "🟢 运行模式 (Preview)" : "🔴 编辑模式 (Edit)"}</label>
            </div>
            <menu role="tablist">
              <li role="tab" aria-selected={activeTab === 'props'} onClick={() => setActiveTab('props')}><a href="#props">属性</a></li>
              <li role="tab" aria-selected={activeTab === 'code'} onClick={() => setActiveTab('code')}><a href="#code">代码</a></li>
            </menu>
            <div className="window" role="tabpanel" style={{flex: 1, marginTop: 8, display: 'flex', flexDirection: 'column'}}>
              <div className="window-body h-full" style={{overflowY: 'auto'}}>
                {activeTab === 'props' && (
                  <div className="flex flex-col gap-3">
                    <fieldset>
                      <legend>全局设置</legend>
                      <div className="field-row-stacked"><label>窗口标题:</label><input type="text" value={windowTitle} onChange={e => setWindowTitle(e.target.value)} /></div>
                      <div className="field-row-stacked mt-2"><label>图标:</label>
                        <div className="flex flex-wrap gap-1 mb-1 p-1 border inset bg-white h-20 overflow-y-auto">
                            {Object.keys(ICONS).map(k => <img key={k} src={ICONS[k]} alt={k} className="w-4 h-4 cursor-pointer hover:bg-blue-200" onClick={() => setWindowIcon(ICONS[k])} title={k} />)}
                        </div>
                        <div className="flex items-center"><img src={windowIcon} alt="current" className="w-4 h-4 mr-2 border border-gray-400" /><input type="file" accept="image/*" onChange={e => handleIconUpload(e, setWindowIcon)} style={{width: '100%'}} /></div>
                      </div>
                      <hr className="my-2" />
                      <div className="field-row"><input type="checkbox" id="chk-grid" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} /><label htmlFor="chk-grid">显示网格</label><input type="number" className="w-12 ml-2" value={gridSize} onChange={e => setGridSize(Number(e.target.value))} /><label>px</label></div>
                    </fieldset>
                    <fieldset>
                      <legend>组件属性</legend>
                      {!selectedId ? (
                        <div className="text-gray-500 p-2">请先在画布中选择组件...</div>
                      ) : (
                        (() => {
                          const w = widgets.find(w => w.id === selectedId);
                          if (!w) return null;
                          return (
                            <div className="flex flex-col gap-2">
                              <div className="font-bold bg-blue-800 text-white px-1 flex justify-between"><span>{getComponentName(w.type)}</span><span className="text-[10px]">{w.x},{w.y}</span></div>
                              <button className="mb-2" onClick={() => removeWidget(w.id)}>删除此组件</button>
                              {'label' in w.props && <div className="field-row-stacked"><label>标签文本:</label><input type="text" value={w.props.label} onChange={e => updateWidgetProps(w.id, 'label', e.target.value)} /></div>}
                              {w.type === 'button' && (
                                <>
                                  <div className="field-row-stacked"><label>对齐方式:</label><select value={w.props.textAlign} onChange={e => updateWidgetProps(w.id, 'textAlign', e.target.value)}><option value="center">居中</option><option value="left">左对齐</option><option value="right">右对齐</option></select></div>
                                  <div className="field-row-stacked"><label>图标设置:</label><div className="flex gap-1"><input type="number" placeholder="W" value={w.props.iconW} onChange={e=>updateWidgetProps(w.id, 'iconW', Number(e.target.value))} className="w-10"/><span>x</span><input type="number" placeholder="H" value={w.props.iconH} onChange={e=>updateWidgetProps(w.id, 'iconH', Number(e.target.value))} className="w-10"/></div><div className="mt-1 flex flex-wrap gap-1 border bg-white h-16 overflow-y-auto p-1">{Object.keys(ICONS).map(k => <img key={k} src={ICONS[k]} className="w-4 h-4 cursor-pointer" onClick={()=>updateWidgetProps(w.id, 'iconSrc', ICONS[k])}/>)}</div><input type="file" className="mt-1" onChange={(e) => handleIconUpload(e, (url) => updateWidgetProps(w.id, 'iconSrc', url))} />{w.props.iconSrc && <button onClick={() => updateWidgetProps(w.id, 'iconSrc', '')}>清除图标</button>}</div>
                                </>
                              )}
                              {w.type === 'image' && <div className="field-row-stacked"><label>图片源:</label><input type="file" onChange={(e) => handleIconUpload(e, (url) => updateWidgetProps(w.id, 'src', url))} /><input type="text" placeholder="或输入URL" value={w.props.src} onChange={e => updateWidgetProps(w.id, 'src', e.target.value)} /></div>}
                              {w.type === 'scrollbtn' && <div className="field-row-stacked"><label>箭头方向:</label><select value={w.props.direction} onChange={e => updateWidgetProps(w.id, 'direction', e.target.value)}><option value="up">上 (Up)</option><option value="down">下 (Down)</option><option value="left">左 (Left)</option><option value="right">右 (Right)</option></select></div>}
                              {'placeholder' in w.props && <div className="field-row-stacked"><label>提示语:</label><input type="text" value={w.props.placeholder} onChange={e => updateWidgetProps(w.id, 'placeholder', e.target.value)} /></div>}
                              {'text' in w.props && <div className="field-row-stacked"><label>文本内容:</label>{w.type === 'statusbar' ? <input type="text" value={w.props.text} onChange={e => updateWidgetProps(w.id, 'text', e.target.value)} /> : <textarea rows={3} value={w.props.text} onChange={e => updateWidgetProps(w.id, 'text', e.target.value)} />}</div>}
                              {'value' in w.props && <div className="field-row-stacked"><label>当前值:</label><input type="text" value={w.props.value} onChange={e => updateWidgetProps(w.id, 'value', e.target.value)} /></div>}
                              {'options' in w.props && <div className="field-row-stacked"><label>选项 (逗号分隔):</label><textarea rows={2} value={w.props.options} onChange={e => updateWidgetProps(w.id, 'options', e.target.value)} /></div>}
                              {'checked' in w.props && <div className="field-row"><input type="checkbox" checked={w.props.checked} onChange={e => updateWidgetProps(w.id, 'checked', e.target.checked)} /><label>默认选中</label></div>}
                            </div>
                          );
                        })()
                      )}
                    </fieldset>
                  </div>
                )}
                {activeTab === 'code' && (
                  <div className="flex flex-col h-full"><textarea className="flex-1 w-full font-mono text-xs p-1 bg-white border-2 border-gray-400 resize-none" readOnly value={generateHTML()} /><div className="flex justify-between items-center mt-2"><button onClick={handleCopy}>复制代码</button><span className="text-green-800 font-bold">{copyFeedback}</span></div></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolItem({ type, icon, label, onDragStart, desc }) {
  return (
    <div className="tool-item group relative" draggable onDragStart={(e) => onDragStart(e, type)} title={desc}>
      <img src={icon} alt="" style={{width:16, height:16}} /><span>{label}</span>
    </div>
  );
}

function WidgetRenderer({ widget, isRunMode }) {
  const { type, props } = widget;
  const styleFull = { width: '100%', height: '100%' };
  const interactiveProps = isRunMode ? {} : { readOnly: true };
  switch (type) {
    case 'button': return <button disabled={props.disabled} style={{...styleFull, display: 'flex', alignItems: 'center', justifyContent: props.textAlign === 'left' ? 'flex-start' : props.textAlign === 'right' ? 'flex-end' : 'center', gap: '4px', padding: '2px'}} onClick={() => isRunMode && console.log('Clicked')}>{props.iconSrc && <img src={props.iconSrc} alt="" style={{width: props.iconW, height: props.iconH}} />}{props.label}</button>;
    case 'text': return <input type="text" placeholder={props.placeholder} defaultValue={props.value} style={styleFull} {...interactiveProps} />;
    case 'textarea': return <textarea style={{...styleFull, resize:'none'}} defaultValue={props.value} {...interactiveProps}></textarea>;
    case 'checkbox': return <div className="field-row h-full flex items-center"><input type="checkbox" defaultChecked={props.checked} disabled={props.disabled} {...interactiveProps} /><label>{props.label}</label></div>;
    case 'radio': return <div className="field-row h-full flex items-center"><input type="radio" name={isRunMode ? props.name : undefined} defaultChecked={props.checked} {...interactiveProps} /><label>{props.label}</label></div>;
    case 'dropdown': return <select style={styleFull} {...interactiveProps}>{props.options.split(',').map((o, i) => <option key={i}>{o}</option>)}</select>;
    case 'listbox': return <select size="5" style={styleFull} {...interactiveProps}>{props.options.split(',').map((o, i) => <option key={i}>{o}</option>)}</select>;
    case 'slider': return <div className="flex items-center h-full w-full px-1"><input type="range" min={props.min} max={props.max} defaultValue={props.value} style={{width:'100%'}} {...interactiveProps} /></div>;
    case 'progressbar': const pct = (props.value / props.max) * 100; return <div style={{width:'100%', height:'100%', border:'1px solid white', boxShadow:'inset -1px -1px #fff, inset 1px 1px grey', background:'#c0c0c0', position:'relative'}}><div style={{background:'navy', height:'100%', width:`${pct}%`}}></div></div>;
    case 'image': return <img src={props.src} alt="" style={{width:'100%', height:'100%', objectFit:'cover', border:'2px inset white'}} />;
    case 'paragraph': return <div style={{...styleFull, overflow:'hidden', whiteSpace:'pre-wrap', display:'flex', alignItems:'center'}}>{props.text}</div>;
    case 'groupbox': return <fieldset style={{width:'100%', height:'100%', margin:0}}><legend>{props.label}</legend></fieldset>;
    case 'tabs': const tabs = props.tabs.split(','); return <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column'}}><menu role="tablist" style={{margin:0}}>{tabs.map((t,i) => <li key={i} role="tab" aria-selected={i===0}><a href="#t">{t}</a></li>)}</menu><div className="window" role="tabpanel" style={{flex:1, margin:0}}></div></div>;
    case 'treeview': return <ul className="tree-view" style={{width:'100%', height:'100%', overflow:'hidden', background:'white', margin:0}}>{props.data.split('\n').map((line, i) => <li key={i} style={{paddingLeft: line.search(/\S/) * 10}}>{line.trim()}</li>)}</ul>;
    case 'statusbar': return <div className="status-bar" style={{width:'100%', height:'100%'}}><p className="status-bar-field">{props.text}</p></div>;
    case 'hscrollbar': return <div className="win-scrollbar" style={{width:'100%', height:'100%', flexDirection: 'row', alignItems: 'center'}}><button className="win-scrollbar-btn" style={{width:16, height:'100%'}}>◄</button><div style={{flex:1, height:'100%', position:'relative'}}><div className="win-thumb" style={{width:20, height:'100%', left:0}}></div></div><button className="win-scrollbar-btn" style={{width:16, height:'100%'}}>►</button></div>;
    case 'vscrollbar': return <div className="win-scrollbar" style={{width:'100%', height:'100%', flexDirection: 'column', alignItems: 'center'}}><button className="win-scrollbar-btn" style={{width:'100%', height:16}}>▲</button><div style={{flex:1, width:'100%', position:'relative'}}><div className="win-thumb" style={{height:20, width:'100%', top:0}}></div></div><button className="win-scrollbar-btn" style={{width:'100%', height:16}}>▼</button></div>;
    case 'scrollbtn': const arrow = props.direction === 'up' ? '▲' : props.direction === 'down' ? '▼' : props.direction === 'left' ? '◄' : '►'; return <button className="win-scrollbar-btn" style={{width:'100%', height:'100%'}}>{arrow}</button>;
    default: return <div>?</div>;
  }
}
