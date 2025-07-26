import { Survey } from "../app/property/components/survey/Survey";
import BasePage from "./BasePage";

export default function SurveyPage () {
    return (
        <BasePage maxWidth={false}>
            <Survey />
        </BasePage>
    );
}