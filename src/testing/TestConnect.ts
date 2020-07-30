import { createConnection } from "typeorm";
import {TEST_DB} from '../secrets';

const testConnection = (toDrop: boolean = false) => {
  return createConnection({
    name: "default",
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: TEST_DB,
    synchronize: toDrop,
    dropSchema: toDrop,
    entities: [__dirname + "/../entities/*.*"]
  });
};

export default testConnection;
