"use client";
import { External } from "@/api/interfaces/external.interface";
import { FC } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";



const formSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExamDetailFormProps {
    // onSave: (attendance: External) => Promise<External>;
}
const ExamDetailForm: FC<ExamDetailFormProps> = (/*{ onSave }*/) => {

    return (
        <div></div>
    );

};

export default ExamDetailForm;