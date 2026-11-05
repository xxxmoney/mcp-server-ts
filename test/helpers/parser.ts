import { z } from "zod";

const DataSchema = z.object({
	result: z.object({
		content: z
			.array(
				z.object({
					type: z.literal("text").optional(),
					text: z.string().optional(),
				}),
			)
			.optional(),
		serverInfo: z
			.object({
				name: z.string().optional(),
			})
			.optional(),
	}),
});
export type Data = z.infer<typeof DataSchema>;

export function parseData(text: string): Data {
	console.log("Parsing data from text:", text);

	const values = text.split("\n");
	// Handle NDJSON and prefixed NDJSON (e.g., "data: {...}" - if prefixed, cleans the prefix)
	const dataValue =
		values
			.find((line) => line.startsWith("data:"))
			?.replace("\n", "")
			?.replace("data:", "") ?? values[0];

	console.log("Extracted data value:", dataValue);

	if (!dataValue) {
		throw new Error("No data found");
	}

	return DataSchema.parse(JSON.parse(dataValue));
}
