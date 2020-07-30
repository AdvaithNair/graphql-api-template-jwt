import { Resolver, Mutation, Arg } from "type-graphql";
//import User from "../../entities/User";
import { UploadImage } from "../../types";
import { GraphQLUpload } from "graphql-upload";
import { createWriteStream } from "fs";
import { Storage } from "@google-cloud/storage";
import path from "path";
import { GCP_STORAGE } from "../../secrets";

/*const getFilename = async (UserID: number, filename: string): Promise<string> => {
  // Returns Null if User Does Not Exist
  if (!UserID) throw new Error("Unauthorized.");

  // Gets the User
  const user = await User.findOne(UserID);
  if (!user) throw new Error("User Not Found");

  // Reduces Filename
  return user.username + "." + filename.split(".")[1];
};*/

@Resolver()
export default class ProfilePictureResolver {
  // Uploads Profile Picture to Server (Locally)
  // NOTE: When Testing, remove Context
  @Mutation(() => Boolean)
  async addProfilePictureLocal(
    @Arg("picture", () => GraphQLUpload)
    { filename, createReadStream }: UploadImage //, @Ctx() context: MyContext)
  ): Promise<boolean> {
    // Gets New Filename
    // const newname: string = await getFilename(context.req.session!.userId, filename)
    const newname: string = filename;

    // Uploads Image
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(
          createWriteStream(__dirname + `/../../../images/profile/${newname}`)
        )
        .on("finish", () => resolve(true))
        .on("error", () => reject(false))
    );
  }

  // Uploads Profile Picture to AWS S3
  @Mutation(() => Boolean)
  async addProfilePictureAWS() {
    return false;
  }

  // Uploads Profile Picture to Google Cloud Storage Bucket
  @Mutation(() => Boolean)
  async addProfilePictureGCP(
    @Arg("picture", () => GraphQLUpload)
    { filename, createReadStream }: UploadImage //@Ctx() context: MyContext
  ) {
    // Initialize Google Cloud Storage Bucket
    const storageGCP = new Storage({
      keyFilename: path.join(__dirname, `../../../${GCP_STORAGE.FILENAME}`)
    });

    console.log(storageGCP);

    // Get Specific Storage Bucket
    const storageBucket = storageGCP.bucket(GCP_STORAGE.BUCKET_NAME);

    // Gets New Filename
    // const newname: string = await getFilename(context.req.session!.userId, filename)
    const newname: string = filename;

    // Uploads Image
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(
          storageBucket
            .file(`profile/${newname}`)
            .createWriteStream({ resumable: false, gzip: true })
        )
        .on("finish", () => resolve(true))
        .on("error", () => reject(false))
    );
  }
}
