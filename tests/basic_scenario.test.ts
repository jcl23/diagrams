import { Diagram } from "../src/data/Diagram";
import { Focusable } from "../src/data/Focusable";
import { Actions } from "../src/editor/Actions";
import { test, expect } from "vitest";
import { FocusableSelection } from "../src/editor/Editor";

test("basic scenario", () => {
    // Create a diagram
    const d = new Diagram();

    // Create 3 objects
    const obj1 = d.addObject("A", { x: 0, y: 0 });
    const obj2 = d.addObject("B", { x: 2, y: 0 });
    const obj3 = d.addObject("C", { x: 4, y: 0 });

    if (!obj1 || !obj2 || !obj3) {
        throw new Error("Failed to create objects");
    }

    // Create arrow from 1st to 2nd
    d.addArrow("f", obj1.id, obj2.id);

    // Create arrow from 2nd to 3rd
    d.addArrow("g", obj2.id, obj3.id);

    let result: FocusableSelection = [];
    const setSelected = (objs: FocusableSelection) => {
        result = objs;
    } 
    Actions.SELECT_NEXT(d, [obj1], setSelected, { x: 1, y: 0 });
    Actions.SELECT_NEXT(d, result, setSelected, { x: 1, y: 0 });
    
    console.log(
        "All ids:", d.objects.map(o => o.id)
    )
    console.log("Next selection after obj1 to the right:", result); // Should select obj2
    expect(result).toEqual([obj2.id]);
    Actions.SELECT_NEXT(d, result, setSelected, { x: 1, y: 0 });
    Actions.SELECT_NEXT(d, result, setSelected, { x: 1, y: 0 });
    expect(result).toEqual([obj3.id]);
});


