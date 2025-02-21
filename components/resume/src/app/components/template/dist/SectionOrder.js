"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.SectionOrder = void 0;
var SectionOrderContext_1 = require("@/components/resume/src/context/SectionOrderContext");
var core_1 = require("@dnd-kit/core");
var sortable_1 = require("@dnd-kit/sortable");
var utilities_1 = require("@dnd-kit/utilities");
var card_1 = require("@/components/ui/card");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var switch_1 = require("@/app/_components/ui/switch");
function SortableItem(_a) {
    var id = _a.id, title = _a.title, visible = _a.visible, onToggle = _a.onToggle;
    var _b = sortable_1.useSortable({ id: id }), attributes = _b.attributes, listeners = _b.listeners, setNodeRef = _b.setNodeRef, transform = _b.transform, transition = _b.transition, isDragging = _b.isDragging;
    var style = {
        transform: utilities_1.CSS.Transform.toString(transform),
        transition: transition
    };
    return (React.createElement("div", { ref: setNodeRef, style: style, className: utils_1.cn("relative", isDragging && "z-50") },
        React.createElement("div", { className: utils_1.cn("flex items-center justify-between p-4 bg-black border rounded-lg", isDragging && "shadow-lg") },
            React.createElement("div", { className: "flex items-center gap-3" },
                React.createElement("button", __assign({}, attributes, listeners, { className: "cursor-grab hover:text-primary" }),
                    React.createElement(lucide_react_1.GripVertical, { className: "h-5 w-5" })),
                React.createElement(label_1.Label, { className: "cursor-pointer", onClick: onToggle }, title)),
            React.createElement(switch_1.Switch, { checked: visible, onCheckedChange: onToggle }))));
}
function SectionOrder() {
    var _a = SectionOrderContext_1.useSectionOrder(), sections = _a.sections, setSections = _a.setSections, toggleSection = _a.toggleSection;
    var sensors = core_1.useSensors(core_1.useSensor(core_1.PointerSensor), core_1.useSensor(core_1.KeyboardSensor, {
        coordinateGetter: sortable_1.sortableKeyboardCoordinates
    }));
    var handleDragEnd = function (event) {
        var active = event.active, over = event.over;
        if (over && active.id !== over.id) {
            // @ts-expect-error - TODO: fix this
            setSections(function (items) {
                var oldIndex = items.findIndex(function (item) { return item.id === active.id; });
                var newIndex = items.findIndex(function (item) { return item.id === over.id; });
                return sortable_1.arrayMove(items, oldIndex, newIndex);
            });
        }
    };
    return (React.createElement(card_1.Card, { className: "p-4" },
        React.createElement(label_1.Label, { className: "mb-4 block" }, "Section Order & Visibility"),
        React.createElement(core_1.DndContext, { sensors: sensors, collisionDetection: core_1.closestCenter, onDragEnd: handleDragEnd },
            React.createElement(sortable_1.SortableContext, { items: sections.map(function (s) { return s.id; }), strategy: sortable_1.verticalListSortingStrategy },
                React.createElement("div", { className: "space-y-2" }, sections.map(function (section) { return (React.createElement(SortableItem, { key: section.id, id: section.id, title: section.title, visible: section.visible, onToggle: function () { return toggleSection(section.id); } })); }))))));
}
exports.SectionOrder = SectionOrder;
