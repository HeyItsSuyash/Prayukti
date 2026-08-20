"use client";

import { useEffect } from "react";
import axios from "axios";

export function AxiosConfig() {
    useEffect(() => {
        axios.defaults.withCredentials = true;
    }, []);

    return null;
}
