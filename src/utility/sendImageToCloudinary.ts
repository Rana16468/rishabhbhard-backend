import { UploadApiResponse, v2 as cloudinary} from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import config from '../app/config';
cloudinary.config({ 
    cloud_name: config.uplode_file_cloudinary.cloudinary_cloud_name, 
    api_key: config.uplode_file_cloudinary.cloudinary_api_key, 
    api_secret: config.uplode_file_cloudinary.cloudinary_api_secret 
  });

  export const sendImageToCloudinary=(imageName:string,path:string):Promise<Record<string,unknown>>=>{

    return new Promise((resolve,reject)=>{
        cloudinary.uploader.upload(path,{ public_id:imageName }, 
            function(error, result) 
            {
                if(error) 
                {
                   
                   
                    reject(error)
                    
                 
                }
               
                resolve(result as UploadApiResponse );
                
                    fs.unlink(path, (err) => {
                       if (err) {
                         reject(err);
                      } else {
                         console.log('Successfully deleted by the file Async')
                    }
                  });
            });
          
    });
 

}

  // multer ---image uploding process
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, process.cwd()+'/src/uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  export const upload = multer({ storage: storage })
 
  