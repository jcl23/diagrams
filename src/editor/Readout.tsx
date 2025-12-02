import React from "react";
import style from "./Readout.module.css";
export const DatumComponent = (key: string, value: string | number) => {
    return (
        <div key={key} className={style.readoutDatum}>
            <span className={style.readoutDatumKey}>{key}:</span>
            <span className={style.readoutDatumValue}>{value}</span>
        </div>
    );
}

export const Readout: React.FC<{ data: Record<string, string | number> }> = ({ data }) => {
    return (
        <div className={style.readout}>
            {Object.entries(data).map(([key, value]) => DatumComponent(key, value))}
        </div>
    );
}