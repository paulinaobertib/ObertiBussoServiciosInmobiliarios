import React from "react";
import { Box, Paper, Typography } from "@mui/material";

interface Props {
    icon: React.ReactNode;
    label: string;
    value: number;
}

export const SummaryCard = ({ icon, label, value }: Props) => (
    <Paper
        elevation={0}
        sx={{
            p: 1,
            border: "1px solid",
            borderColor: "divider",
        }}
    >
        <Box display="flex" alignItems="center" ml={2} gap={2}>
            {icon}
            <Typography variant="body1" fontWeight={600}>
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
                {value}
            </Typography>
        </Box>
    </Paper>
);
