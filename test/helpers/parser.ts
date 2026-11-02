import { z } from "zod";

const DataSchema = z.object({
	result: z.object({
		content: z.array(
			z.object({
				text: z.string(),
			}),
		),
	}),
});
type Data = z.infer<typeof DataSchema>;

export function parseData(text: string): Data {
	const dataValue = text
		.split("\n")
		.find((line) => line.startsWith("data:"))
		?.replace("\n", "")
		?.replace("data:", "\n");

	if (!dataValue) {
		throw new Error("No data found");
	}

	return DataSchema.parse(JSON.parse(dataValue));
}
