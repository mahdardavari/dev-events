import mongoose, {Document, Model, Schema} from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Interface for lean query results (when using .lean())
export interface IEventLean {
    _id: string;
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        overview: {
            type: String,
            required: [true, 'Overview is required'],
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Image is required'],
            trim: true,
        },
        venue: {
            type: String,
            required: [true, 'Venue is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        date: {
            type: String,
            required: [true, 'Date is required'],
        },
        time: {
            type: String,
            required: [true, 'Time is required'],
        },
        mode: {
            type: String,
            required: [true, 'Mode is required'],
            enum: {
                values: ['online', 'offline', 'hybrid'],
                message: 'Mode must be online, offline, or hybrid',
            },
        },
        audience: {
            type: String,
            required: [true, 'Audience is required'],
            trim: true,
        },
        agenda: {
            type: [String],
            required: [true, 'Agenda is required'],
            validate: {
                validator: (v: string[]) => Array.isArray(v) && v.length > 0,
                message: 'Agenda must contain at least one item',
            },
        },
        organizer: {
            type: String,
            required: [true, 'Organizer is required'],
            trim: true,
        },
        tags: {
            type: [String],
            required: [true, 'Tags are required'],
            validate: {
                validator: (v: string[]) => Array.isArray(v) && v.length > 0,
                message: 'At least one tag is required',
            },
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt
    }
);

/**
 * Pre-save hook to:
 * 1. Generate URL-friendly slug from title (only if title changed)
 * 2. Normalize date to ISO format
 * 3. Normalize time to consistent format (HH:MM)
 */
EventSchema.pre('save', function (next) {
    // Generate slug only if title is modified or document is new
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    // Normalize date to ISO format (YYYY-MM-DD)
    if (this.isModified('date')) {
        try {
            const parsedDate = new Date(this.date);
            if (isNaN(parsedDate.getTime())) {
                return next(new Error('Invalid date format'));
            }
            // Store as ISO date string (YYYY-MM-DD)
            this.date = parsedDate.toISOString().split('T')[0];
        } catch (error) {
            return next(new Error('Invalid date format'));
        }
    }

    // Normalize time format to HH:MM (24-hour format)
    if (this.isModified('time')) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        if (!timeRegex.test(this.time)) {
            return next(new Error('Time must be in HH:MM format (24-hour)'));
        }
        // Pad with leading zero if needed
        const [hours, minutes] = this.time.split(':');
        this.time = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    next();
});

// Create index on slug for faster queries
EventSchema.index({slug: 1});

// Prevent model recompilation in development
const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
