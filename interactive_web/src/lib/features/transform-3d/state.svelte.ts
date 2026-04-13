export function createTransform3DState() {
    // A chosen generic vector defining the transformed axis
    let vx = $state(1);
    let vy = $state(1);
    let vz = $state(1.5);

    // Strain tensor components (microstrain or arbitrary units)
    let epsX = $state(100);
    let epsY = $state(50);
    let epsZ = $state(0);

    let gammaXY = $state(40);
    let gammaYZ = $state(60);
    let gammaZX = $state(-20);

    return {
        get vx() { return vx; }, set vx(val) { vx = val; },
        get vy() { return vy; }, set vy(val) { vy = val; },
        get vz() { return vz; }, set vz(val) { vz = val; },

        get epsX() { return epsX; }, set epsX(val) { epsX = val; },
        get epsY() { return epsY; }, set epsY(val) { epsY = val; },
        get epsZ() { return epsZ; }, set epsZ(val) { epsZ = val; },
        get gammaXY() { return gammaXY; }, set gammaXY(val) { gammaXY = val; },
        get gammaYZ() { return gammaYZ; }, set gammaYZ(val) { gammaYZ = val; },
        get gammaZX() { return gammaZX; }, set gammaZX(val) { gammaZX = val; },

        get mag() { return Math.sqrt(vx * vx + vy * vy + vz * vz) || 1; },
        get l() { return vx / this.mag; },
        get m() { return vy / this.mag; },
        get n() { return vz / this.mag; },

        get thetaX() { return Math.acos(this.l) * (180 / Math.PI); },
        get thetaY() { return Math.acos(this.m) * (180 / Math.PI); },
        get thetaZ() { return Math.acos(this.n) * (180 / Math.PI); },

        // First Invariant (Trace)
        get J1() { return epsX + epsY + epsZ; },

        // Second Invariant (Sum of Principal Minors)
        get J2() {
            return (epsX * epsY + epsY * epsZ + epsZ * epsX)
                - (Math.pow(gammaXY / 2, 2) + Math.pow(gammaYZ / 2, 2) + Math.pow(gammaZX / 2, 2));
        },

        // Third Invariant (Determinant)
        get J3() {
            const eX = epsX, eY = epsY, eZ = epsZ;
            const gXY = gammaXY / 2, gYZ = gammaYZ / 2, gZX = gammaZX / 2;
            return eX * eY * eZ + 2 * gXY * gYZ * gZX - eX * gYZ * gYZ - eY * gZX * gZX - eZ * gXY * gXY;
        }
    };
}

export type Transform3DState = ReturnType<typeof createTransform3DState>;
