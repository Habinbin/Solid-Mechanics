export function createShearState() {
    let dx = $state(200);
    let dy = $state(200);
    let u = $state(0);
    let v = $state(0);

    return {
        get dx() { return dx; },
        set dx(val) { dx = val; },
        get dy() { return dy; },
        set dy(val) { dy = val; },
        get u() { return u; },
        set u(val) { u = val; },
        get v() { return v; },
        set v(val) { v = val; },
        get alpha() { return Math.atan2(u, dy); },
        get beta() { return Math.atan2(v, dx); },
        get gamma() { return this.alpha + this.beta; }
    };
}

export type ShearState = ReturnType<typeof createShearState>;
