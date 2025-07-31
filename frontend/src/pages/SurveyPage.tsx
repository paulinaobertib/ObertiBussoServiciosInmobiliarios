import { Survey } from "../app/property/components/survey/SurveyForm";
import BasePage from "./BasePage";

export default function SurveyPage() {
    return (
        <BasePage maxWidth={false}>
            <Survey />
        </BasePage>
    );
}