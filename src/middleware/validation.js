const { z } = require('zod');


const genericPhoneNumberSchema = z.string({ required_error: "Phone number is required" }).trim()
  .superRefine((val, ctx) => {
    if (val === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number must contain between 7 and 15 digits."
      });
      return; 
    }

    
    if (!/^[0-9#*+]*$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number can only contain digits (0-9) and special characters (+, #, *)."
      });
      return; 
    }

   
    const digitCount = (val.match(/\d/g) || []).length;
    if (!(digitCount >= 7 && digitCount <= 15)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number must contain between 7 and 15 digits."
      });
    }
  });

const validateRegistrationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "name is required" }).trim()
      .superRefine((val, ctx) => {
       
        if (/[0-9@#!$&]/.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Name cannot contain numbers or special characters like @, #, !, $, &."
          });
          return;
        }

        
        if (val.length < 2 || val.length > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom, 
            message: 'Name must be between 2 and 100 characters'
          });
        }
      }),
    phoneNumber: genericPhoneNumberSchema,
    email: z.string({invalid_type_error: "Email must be a string"})
      .email('Email must be a valid email address')
      .max(254, 'Email must be 254 characters or less')
      .optional(),
    password: z.string({ required_error: "password is required" }).min(6, 'Password must be at least 6 characters long'),
  }),
});

const validateLoginSchema = z.object({
  body: z.object({
    phoneNumber: genericPhoneNumberSchema,
    password: z.string({ required_error: "password is required" }).min(1, 'Password is required'),
  }).strict({ message: "Login request must only contain phoneNumber and password." }),
});

const validateNameSearchSchema = z.object({
  query: z.object({
    name: z.string({ required_error: "name is required" }).trim()
      .superRefine((val, ctx) => {
        
        if (/[0-9@#!$&]/.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Name cannot contain numbers or special characters like @, #, !, $, &."
          });
          return; 
        }

       
        if (val.length < 1 || val.length > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Name must be between 1 and 100 characters'
          });
        }
      }),
  }),
});

const validatePhoneSearchSchema = z.object({
  query: z.object({
    phoneNumber: genericPhoneNumberSchema,
  }),
});

const validateSpamReportSchema = z.object({
  body: z.object({
    phoneNumber: genericPhoneNumberSchema,
  }),
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.errors.map(err => ({
          message: err.message,
          path: err.path.join('.'),
        })),
      });
    }
    
    next(error);
  }
};

module.exports = {
  validate,
  validateRegistrationSchema,
  validateLoginSchema,
  validateNameSearchSchema,
  validatePhoneSearchSchema,
  validateSpamReportSchema,
};