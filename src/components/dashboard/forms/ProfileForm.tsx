"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ImageUploadButton from "@/components/UploadImage";
import { useState, useEffect } from "react";
import { updateUserProfile, getUserProfile } from "@/actions/admin/profileActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Gender,
  ProfileFormData, 
  profileSchema,
  type Profile
} from "@/types/profile";
import Image from "next/image";
import { z } from "zod";

// Type for form data that ensures compatibility with the form library
type FormData = {
  bio: string;
  avatar: string;
  gender?: Gender;
  position: string;
  idCard: string;
  nationality: string;
  homeDomicile: string;
  location: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    github: string;
    website: string;
  };
};

export default function ProfileForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [socialLinks, setSocialLinks] = useState<FormData["socialLinks"]>({
    twitter: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    github: "",
    website: "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(profileSchema as z.ZodType<any>),
    defaultValues: {
      bio: "",
      avatar: "",
      gender: undefined,
      position: "",
      idCard: "",
      nationality: "",
      homeDomicile: "",
      location: "",
      socialLinks: {
        twitter: "",
        facebook: "",
        instagram: "",
        linkedin: "",
        github: "",
        website: "",
      },
    },
  });

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const result = await getUserProfile();

        if (result.success && result.data) {
          const profile = result.data as unknown as Profile;

          // Set form values for all fields from Prisma schema
          setValue("bio", profile.bio || "");
          setValue("avatar", profile.avatar || "");
          setValue("gender", profile.gender || undefined);
          setValue("position", profile.position || "");
          setValue("idCard", profile.idCard || "");
          setValue("nationality", profile.nationality || "");
          setValue("homeDomicile", profile.homeDomicile || "");
          
          // Additional UI fields
          setValue("location", profile.location || "");

          // Handle social links (JSON)
          const links = profile.socialLinks
            ? typeof profile.socialLinks === "string"
              ? JSON.parse(profile.socialLinks)
              : profile.socialLinks
            : {};

          setSocialLinks(links);
          setValue("socialLinks", links);

          // Set local state
          setAvatarUrl(profile.avatar || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [setValue]);

  // Handle avatar upload
  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
    setValue("avatar", url);
  };

  // Handle social link change
  const handleSocialLinkChange = (
    platform: keyof typeof socialLinks,
    value: string
  ) => {
    const updatedLinks = { ...socialLinks, [platform]: value };
    setSocialLinks(updatedLinks);
    setValue("socialLinks", updatedLinks);
  };

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Create FormData object
      const formData = new FormData();

      // Add all form data fields from Prisma schema
      formData.append("bio", data.bio || "");
      formData.append("avatar", data.avatar || "");
      if (data.gender) formData.append("gender", data.gender);
      formData.append("position", data.position || "");
      formData.append("idCard", data.idCard || "");
      formData.append("nationality", data.nationality || "");
      formData.append("homeDomicile", data.homeDomicile || "");
      
      // Additional UI fields
      formData.append("location", data.location || "");

      // Add social links as JSON
      formData.append("socialLinks", JSON.stringify(data.socialLinks || {}));

      // Call the server action
      const result = await updateUserProfile(formData);

      if (!result.success) {
        toast.error(result.error || "Update failed!");
        if (result.details) {
          console.error("Form error details:", result.details);
        }
        return;
      }

      // Success handling
      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An internal error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-6">Loading profile data...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Avatar */}
      <div className="space-y-2">
        <Label htmlFor="avatar">Profile Picture</Label>
        <ImageUploadButton onImageUpload={handleAvatarUpload} />
        {avatarUrl && (
          <div className="flex items-center gap-2 mt-2">
            <Image
              src={avatarUrl}
              alt="Avatar Preview"
              className="h-20 w-20 rounded-full object-cover"
              width={80}
              height={80}
            />
            <Input
              id="avatar"
              {...register("avatar")}
              value={avatarUrl}
              readOnly
              type="hidden"
            />
          </div>
        )}
        {errors.avatar && (
          <p className="text-red-500 text-sm">{errors.avatar.message}</p>
        )}
      </div>

      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg text-center bg-gray-100 px-2 rounded-md w-1/8">
          Basic Information
        </h3>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            onValueChange={(value) => setValue("gender", value as Gender)}
            defaultValue={undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Gender.MALE}>Male</SelectItem>
              <SelectItem value={Gender.FEMALE}>Female</SelectItem>
              <SelectItem value={Gender.OTHER}>Other</SelectItem>
              <SelectItem value={Gender.PREFER_NOT_TO_SAY}>
                Prefer not to say
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-red-500 text-sm">{errors.gender.message}</p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            {...register("bio")}
            placeholder="Tell us about yourself"
            className="min-h-24"
          />
          {errors.bio && (
            <p className="text-red-500 text-sm">{errors.bio.message}</p>
          )}
        </div>

        {/* Position/Job Title */}
        <div className="space-y-2">
          <Label htmlFor="position">Job Title or Position</Label>
          <Input
            id="position"
            {...register("position")}
            placeholder="E.g., Software Engineer"
          />
          {errors.position && (
            <p className="text-red-500 text-sm">{errors.position.message}</p>
          )}
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            {...register("nationality")}
            placeholder="Your nationality"
          />
          {errors.nationality && (
            <p className="text-red-500 text-sm">{errors.nationality.message}</p>
          )}
        </div>
      </div>

      {/* Contact & Location Section */}
      <div className="space-y-4">
        <h3 className="text-lg text-center bg-gray-100 px-2 rounded-md w-1/8">
          Contact & Location
        </h3>

        {/* ID Card */}
        <div className="space-y-2">
          <Label htmlFor="idCard">ID Card Number</Label>
          <Input
            id="idCard"
            {...register("idCard")}
            placeholder="Your ID card number"
          />
          {errors.idCard && (
            <p className="text-red-500 text-sm">{errors.idCard.message}</p>
          )}
        </div>

        {/* Home Address */}
        <div className="space-y-2">
          <Label htmlFor="homeDomicile">Home Address</Label>
          <Textarea
            id="homeDomicile"
            {...register("homeDomicile")}
            placeholder="Your permanent address"
          />
          {errors.homeDomicile && (
            <p className="text-red-500 text-sm">
              {errors.homeDomicile.message}
            </p>
          )}
        </div>

        {/* Location (City/Country) */}
        <div className="space-y-2">
          <Label htmlFor="location">Current Location</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="City, Country"
          />
          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location.message}</p>
          )}
        </div>
      </div>

      {/* Social Links Section */}
      <div className="space-y-4">
        <h3 className="text-lg text-center bg-gray-100 px-2 rounded-md w-1/8">
          Social Media Links
        </h3>

        {/* Social Media Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Twitter */}
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              value={socialLinks.twitter}
              onChange={(e) =>
                handleSocialLinkChange("twitter", e.target.value)
              }
              placeholder="https://twitter.com/username"
            />
            {errors.socialLinks?.twitter && (
              <p className="text-red-500 text-sm">
                {errors.socialLinks?.twitter?.message as string}
              </p>
            )}
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={socialLinks.linkedin}
              onChange={(e) =>
                handleSocialLinkChange("linkedin", e.target.value)
              }
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          {/* GitHub */}
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={socialLinks.github}
              onChange={(e) => handleSocialLinkChange("github", e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>

          {/* Personal Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Personal Website</Label>
            <Input
              id="website"
              value={socialLinks.website}
              onChange={(e) =>
                handleSocialLinkChange("website", e.target.value)
              }
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
