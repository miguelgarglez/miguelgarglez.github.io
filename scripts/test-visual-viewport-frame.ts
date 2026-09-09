import assert from "node:assert/strict";
import {
  applyVisualViewportFrame,
  clearVisualViewportFrame,
  getVisualViewportFrame,
} from "../cv-chat/src/lib/visual-viewport-frame.ts";

function testFallbackWhenViewportMissing() {
  const frame = getVisualViewportFrame(null, { width: 390, height: 844 });
  assert.deepEqual(frame, {
    top: 0,
    left: 0,
    width: 390,
    height: 844,
  });
}

function testKeyboardOpenShrinksHeightAndOffsetsTop() {
  // Typical iOS Safari behavior: layout stays tall, visual viewport shrinks and
  // may gain an offsetTop when Safari pans to keep the focused input visible.
  const frame = getVisualViewportFrame(
    {
      offsetTop: 120,
      offsetLeft: 0,
      width: 390,
      height: 420,
    },
    { width: 390, height: 844 }
  );

  assert.deepEqual(frame, {
    top: 120,
    left: 0,
    width: 390,
    height: 420,
  });
}

function testNegativeOrInvalidValuesAreClamped() {
  const frame = getVisualViewportFrame(
    {
      offsetTop: -8,
      offsetLeft: -4,
      width: -10,
      height: -20,
    },
    { width: -1, height: -2 }
  );

  assert.deepEqual(frame, {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const fallback = getVisualViewportFrame(undefined, {
    width: -5,
    height: 100,
  });
  assert.deepEqual(fallback, {
    top: 0,
    left: 0,
    width: 0,
    height: 100,
  });
}

function testApplyAndClearFrameStyles() {
  const style: Record<string, string> = {
    top: "",
    left: "",
    width: "",
    height: "",
    right: "",
    bottom: "",
    minHeight: "",
  };
  const element = { style } as unknown as HTMLElement;

  applyVisualViewportFrame(element, {
    top: 48,
    left: 0,
    width: 390,
    height: 500,
  });

  assert.equal(style.top, "48px");
  assert.equal(style.left, "0px");
  assert.equal(style.width, "390px");
  assert.equal(style.height, "500px");
  assert.equal(style.right, "auto");
  assert.equal(style.bottom, "auto");
  assert.equal(style.minHeight, "0px");

  clearVisualViewportFrame(element);
  assert.equal(style.top, "");
  assert.equal(style.left, "");
  assert.equal(style.width, "");
  assert.equal(style.height, "");
  assert.equal(style.right, "");
  assert.equal(style.bottom, "");
  assert.equal(style.minHeight, "");
}

testFallbackWhenViewportMissing();
testKeyboardOpenShrinksHeightAndOffsetsTop();
testNegativeOrInvalidValuesAreClamped();
testApplyAndClearFrameStyles();

console.log("visual-viewport-frame tests passed");
