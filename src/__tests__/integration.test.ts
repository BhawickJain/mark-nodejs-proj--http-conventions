import supertest from "supertest";
import app from "../server";
import { PartialSignature, setAllSignatures } from "../signature/model";

describe("integration test for signatures", () => {
  beforeAll(() => {
    setAllSignatures([]);
  });

  test("GET /signatures responds with an empty array for signatures", async () => {
    const response = await supertest(app).get("/signatures");
    expect(response.body.data.signatures).toStrictEqual([]);
  });

  test("POST /signatures, there's now a signature in the array", async () => {
    const partialSignature: PartialSignature = {
      name: "Joanna Blogg",
    };
    await supertest(app).post("/signatures").send(partialSignature);
    const response = await supertest(app).get("/signatures");
    expect(response.body.data.signatures).toHaveLength(1);
  });

  test("GET /signatures/:epoch request using the epochId of the newly created signature", async () => {
    const response = await supertest(app).get("/signatures");
    const epochId = response.body.data.signatures[0].epochId;
    const requestByIDResponse = await supertest(app).get(
      `/signatures/${epochId}`
    );
    expect(requestByIDResponse.body.data.signature.epochId).toBe(epochId);
  });

  test("PUT /signatures/:epoch to update the same signature", async () => {
    const response = await supertest(app).get("/signatures");
    const epochId = response.body.data.signatures[0].epochId;
    const updatedPartial: PartialSignature = {
      message: "I am on holiday",
    };
    await supertest(app).put(`/signatures/${epochId}`).send(updatedPartial);
    const requestByIDResponse = await supertest(app).get(
      `/signatures/${epochId}`
    );
    expect(requestByIDResponse.body.data.signature.message).toBe(
      updatedPartial.message
    );
  });

  test("DELETE /signatures/:epoch", async () => {
    const response = await supertest(app).get("/signatures");
    const epochId = response.body.data.signatures[0].epochId;
    await supertest(app).delete(`/signatures/${epochId}`);
    const responseAfterDeletion = await supertest(app).get(
      `/signatures/${epochId}`
    );
    expect(responseAfterDeletion.status).toBe(404);
  });

  test("GET /signatures/:epoch", async () => {
    const response = await supertest(app).get("/signatures");
    expect(response.body.data.signatures).toHaveLength(0);
  });
});
