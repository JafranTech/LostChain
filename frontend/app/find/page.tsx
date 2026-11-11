"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { addLostItem, getUserProfile, isProfileComplete } from "@/lib/data-store";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { LOSTCHAIN_CONTRACT_ADDRESS, LOSTCHAIN_ABI, hashField, generateSalt } from "@/lib/web3";
import { ProfileDialog } from "@/components/ui/auth-dialog";

// Define cascading data structure (same as category page)
const categoryData = {
  electronics: {
    label: "Electronics",
    subcategories: {
      mobile: {
        label: "Mobile Devices",
        items: {
          phone: { label: "Phone", brands: ["Apple", "Samsung", "Google", "OnePlus"] },
          tablet: { label: "Tablet", brands: ["Apple", "Samsung", "Microsoft", "Amazon"] },
          smartwatch: { label: "Smartwatch", brands: ["Apple", "Samsung", "Garmin", "Fitbit"] },
        },
      },
      computer: {
        label: "Computers",
        items: {
          laptop: { label: "Laptop", brands: ["Apple", "Dell", "HP", "Lenovo"] },
          desktop: { label: "Desktop", brands: ["Dell", "HP", "Apple", "Custom Built"] },
          monitor: { label: "Monitor", brands: ["Dell", "LG", "Samsung", "ASUS"] },
        },
      },
      audio: {
        label: "Audio Devices",
        items: {
          headphones: { label: "Headphones", brands: ["Sony", "Bose", "Apple", "Sennheiser"] },
          earbuds: { label: "Earbuds", brands: ["Apple", "Samsung", "Sony", "Jabra"] },
          speaker: { label: "Speaker", brands: ["JBL", "Bose", "Sony", "Ultimate Ears"] },
        },
      },
    },
  },
  accessories: {
    label: "Accessories",
    subcategories: {
      bags: {
        label: "Bags & Backpacks",
        items: {
          backpack: { label: "Backpack", brands: ["Jansport", "North Face", "Nike", "Herschel"] },
          messenger: { label: "Messenger Bag", brands: ["Timbuk2", "Chrome", "Fossil", "Coach"] },
          tote: { label: "Tote Bag", brands: ["Longchamp", "Michael Kors", "Kate Spade", "Generic"] },
        },
      },
      clothing: {
        label: "Clothing",
        items: {
          jacket: { label: "Jacket", brands: ["North Face", "Patagonia", "Columbia", "Nike"] },
          hoodie: { label: "Hoodie", brands: ["Nike", "Adidas", "Champion", "University Merch"] },
          hat: { label: "Hat/Cap", brands: ["New Era", "Nike", "Adidas", "Generic"] },
        },
      },
      jewelry: {
        label: "Jewelry & Watches",
        items: {
          watch: { label: "Watch", brands: ["Rolex", "Casio", "Timex", "Fossil"] },
          necklace: { label: "Necklace", brands: ["Tiffany", "Pandora", "Custom", "Generic"] },
          bracelet: { label: "Bracelet", brands: ["Pandora", "Alex and Ani", "Custom", "Generic"] },
        },
      },
    },
  },
  documents: {
    label: "Documents & IDs",
    subcategories: {
      identification: {
        label: "Identification",
        items: {
          studentid: { label: "Student ID", brands: ["University Issued"] },
          driverslicense: { label: "Driver's License", brands: ["State Issued"] },
          passport: { label: "Passport", brands: ["Country Issued"] },
        },
      },
      cards: {
        label: "Cards",
        items: {
          creditcard: { label: "Credit/Debit Card", brands: ["Visa", "Mastercard", "Amex", "Discover"] },
          giftcard: { label: "Gift Card", brands: ["Amazon", "Starbucks", "Target", "Generic"] },
          keycard: { label: "Key Card", brands: ["Building Access", "Hotel", "Office"] },
        },
      },
    },
  },
  sports: {
    label: "Sports & Recreation",
    subcategories: {
      equipment: {
        label: "Sports Equipment",
        items: {
          basketball: { label: "Basketball", brands: ["Spalding", "Wilson", "Nike", "Generic"] },
          soccerball: { label: "Soccer Ball", brands: ["Adidas", "Nike", "Puma", "Generic"] },
          tennisracket: { label: "Tennis Racket", brands: ["Wilson", "Head", "Babolat", "Prince"] },
          baseball: { label: "Baseball/Glove", brands: ["Rawlings", "Wilson", "Mizuno", "Generic"] },
        },
      },
      gym: {
        label: "Gym Gear",
        items: {
          waterbottle: { label: "Water Bottle", brands: ["Hydro Flask", "Nalgene", "Contigo", "Generic"] },
          gymbag: { label: "Gym Bag", brands: ["Nike", "Adidas", "Under Armour", "Generic"] },
          yogamat: { label: "Yoga Mat", brands: ["Manduka", "Gaiam", "Lululemon", "Generic"] },
        },
      },
      recreation: {
        label: "Recreation Items",
        items: {
          frisbee: { label: "Frisbee", brands: ["Discraft", "Innova", "Wham-O", "Generic"] },
          skateboard: { label: "Skateboard", brands: ["Element", "Baker", "Zero", "Generic"] },
          bikeaccessory: { label: "Bike Accessory", brands: ["Kryptonite", "Bell", "Schwinn", "Generic"] },
        },
      },
    },
  },
  school: {
    label: "School Supplies",
    subcategories: {
      books: {
        label: "Textbooks",
        items: {
          mathbook: { label: "Math Textbook", brands: ["Pearson", "McGraw-Hill", "Cengage", "Wiley"] },
          sciencebook: { label: "Science Textbook", brands: ["Pearson", "McGraw-Hill", "Cengage", "Wiley"] },
          englishbook: { label: "English/Literature Book", brands: ["Pearson", "Norton", "Bedford", "Generic"] },
          otherbook: { label: "Other Textbook", brands: ["Pearson", "McGraw-Hill", "Cengage", "Generic"] },
        },
      },
      supplies: {
        label: "Writing & Supplies",
        items: {
          notebook: { label: "Notebook/Binder", brands: ["Five Star", "Mead", "Moleskine", "Generic"] },
          calculator: { label: "Calculator", brands: ["TI", "Casio", "HP", "Sharp"] },
          labequipment: { label: "Lab Equipment", brands: ["School Issued", "Generic"] },
        },
      },
      art: {
        label: "Art Supplies",
        items: {
          sketchbook: { label: "Sketchbook", brands: ["Moleskine", "Strathmore", "Canson", "Generic"] },
          artsupplies: { label: "Art Supplies", brands: ["Crayola", "Prismacolor", "Faber-Castell", "Generic"] },
        },
      },
    },
  },
  keys: {
    label: "Keys & Access Items",
    subcategories: {
      keys: {
        label: "Keys",
        items: {
          housekeys: { label: "House/Dorm Keys", brands: ["Generic", "With Keychain", "Loose"] },
          carkeys: { label: "Car Keys", brands: ["Toyota", "Honda", "Ford", "Other"] },
          keychain: { label: "Key Chain", brands: ["Custom", "Branded", "Generic"] },
        },
      },
      access: {
        label: "Access Items",
        items: {
          accessfob: { label: "Access Fob", brands: ["Building Access", "Parking", "Generic"] },
          remotecontrol: { label: "Remote Control", brands: ["Car Remote", "Garage Remote", "Generic"] },
        },
      },
    },
  },
  personal: {
    label: "Personal Care",
    subcategories: {
      eyewear: {
        label: "Eyewear",
        items: {
          glasses: { label: "Prescription Glasses", brands: ["Ray-Ban", "Oakley", "Warby Parker", "Generic"] },
          sunglasses: { label: "Sunglasses", brands: ["Ray-Ban", "Oakley", "Maui Jim", "Generic"] },
          case: { label: "Glasses Case", brands: ["Generic", "Branded"] },
        },
      },
      weather: {
        label: "Weather Protection",
        items: {
          umbrella: { label: "Umbrella", brands: ["Totes", "ShedRain", "Generic"] },
          raincoat: { label: "Rain Coat/Poncho", brands: ["Columbia", "North Face", "Generic"] },
        },
      },
      containers: {
        label: "Containers & Bottles",
        items: {
          thermos: { label: "Thermos/Tumbler", brands: ["Yeti", "Stanley", "Contigo", "Generic"] },
          lunchbox: { label: "Lunch Box", brands: ["Thermos", "Bentgo", "Generic"] },
        },
      },
    },
  },
};

// Color options
const colorOptions = [
  "Black",
  "White",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Brown",
  "Other",
];

const formSchema = z.object({
  category: z.string().min(1, { message: "Please select a category." }),
  subcategory: z.string().min(1, { message: "Please select a subcategory." }),
  itemType: z.string().min(1, { message: "Please select an item type." }),
  brand: z.string().min(1, { message: "Please select a brand." }),
  color: z.string().min(1, { message: "Please select a color." }),
  distinctFeatures: z.string().min(10, {
    message: "Distinct features must be at least 10 characters.",
  }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  dateLost: z.string().min(1, { message: "Please provide the date you lost the item." }),
  rewardAmount: z.string().min(1, { message: "Please enter a reward amount (minimum 0.001 ETH)." }),
});

export default function FindItemPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedItemType, setSelectedItemType] = useState<string>("");
  const [availableSubcategories, setAvailableSubcategories] = useState<any>({});
  const [availableItems, setAvailableItems] = useState<any>({});
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      subcategory: "",
      itemType: "",
      brand: "",
      color: "",
      distinctFeatures: "",
      location: "",
      dateLost: "",
      rewardAmount: "0.001",
    },
  });

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const categoryObj = categoryData[selectedCategory as keyof typeof categoryData];
      setAvailableSubcategories(categoryObj?.subcategories || {});
      setSelectedSubcategory("");
      setSelectedItemType("");
      setAvailableItems({});
      setAvailableBrands([]);
      form.setValue("subcategory", "");
      form.setValue("itemType", "");
      form.setValue("brand", "");
    }
  }, [selectedCategory, form]);

  // Update items when subcategory changes
  useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      const categoryObj = categoryData[selectedCategory as keyof typeof categoryData];
      const subcategoryObj = (categoryObj?.subcategories as any)[selectedSubcategory];
      setAvailableItems(subcategoryObj?.items || {});
      setSelectedItemType("");
      setAvailableBrands([]);
      form.setValue("itemType", "");
      form.setValue("brand", "");
    }
  }, [selectedSubcategory, selectedCategory, form]);

  // Update brands when item type changes
  useEffect(() => {
    if (selectedCategory && selectedSubcategory && selectedItemType) {
      const categoryObj = categoryData[selectedCategory as keyof typeof categoryData];
      const subcategoryObj = (categoryObj?.subcategories as any)[selectedSubcategory];
      const itemObj = (subcategoryObj?.items as any)[selectedItemType];
      setAvailableBrands(itemObj?.brands || []);
      form.setValue("brand", "");
    }
  }, [selectedItemType, selectedSubcategory, selectedCategory, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isConnected || !address) {
      setSubmitStatus('error');
      setSubmitMessage('Please connect your wallet to submit a report.');
      return;
    }

    // Check if profile is complete
    if (!isProfileComplete(address)) {
      setShowProfileDialog(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      setSubmitMessage('Please confirm the transaction in MetaMask to lock your reward in escrow...');
      let txHash: string | undefined;

      try {
        const categoryHash = hashField(values.category);
        const subcategoryHash = hashField(values.subcategory);
        const itemTypeHash = hashField(values.itemType);
        const brandHash = hashField(values.brand);
        const colorHash = hashField(values.color);
        const distinctFeaturesHash = hashField(values.distinctFeatures);
        const locationHash = hashField(values.location);
        const dateLostTimestamp = Math.min(
          Math.floor(new Date(values.dateLost).getTime() / 1000) || Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000)
        );
        const salt = generateSalt();
        const rewardWei = parseEther(values.rewardAmount || "0.001");

        const hash = await writeContractAsync({
          address: LOSTCHAIN_CONTRACT_ADDRESS,
          abi: LOSTCHAIN_ABI,
          functionName: "reportLostItem",
          args: [
            categoryHash,
            subcategoryHash,
            itemTypeHash,
            brandHash,
            colorHash,
            distinctFeaturesHash,
            locationHash,
            BigInt(dateLostTimestamp),
            salt,
          ],
          value: rewardWei,
        });
        txHash = hash;
      } catch (contractErr: any) {
        console.warn("Smart contract call warning:", contractErr);
        if (contractErr.message?.includes("User rejected") || contractErr.name === "UserRejectedRequestError") {
          throw new Error("Transaction was rejected in your wallet.");
        }
      }

      // Save to data store with user's wallet address and on-chain tx
      const report = addLostItem({
        category: values.category,
        subcategory: values.subcategory,
        itemType: values.itemType,
        brand: values.brand,
        color: values.color,
        distinctFeatures: values.distinctFeatures,
        location: values.location,
        dateLost: values.dateLost,
        rewardAmount: values.rewardAmount,
        txHash,
      }, address);
      
      console.log('Lost Item Report Submitted:', report);
      
      // Success!
      setSubmitStatus('success');
      setSubmitMessage(
        txHash
          ? `Report submitted and reward escrowed on-chain! Tx: ${txHash.slice(0, 10)}...`
          : 'Your lost item report has been submitted successfully! Redirecting...'
      );
      
      // Redirect to confirmation page after 1.5 seconds
      setTimeout(() => {
        router.push('/confirmation?type=find');
      }, 1500);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#000F08] text-white flex flex-col relative selection:bg-[#FB3640] selection:text-white">
      {/* Liquid Glass Header */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-white/10 bg-[#000F08]/75 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FB3640] to-[#991B1B] flex items-center justify-center shadow-[0_0_15px_rgba(251,54,64,0.4)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-kontras text-3xl font-semibold tracking-tight text-white group-hover:text-[#FB3640] transition-colors">
            Lost<span className="text-[#FB3640]">Chain</span>
          </span>
        </Link>
        
        <nav className="flex items-center gap-8">
          <Link href="/find" className="text-sm font-medium text-[#FB3640] transition-colors">
            Find Item
          </Link>
          <Link href="/report" className="text-sm font-medium text-gray-300 hover:text-[#FB3640] transition-colors">
            Report Item
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-[#FB3640] transition-colors">
            Dashboard
          </Link>
          <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-[#FB3640] transition-colors">
            About
          </Link>
          <AuthButton />
        </nav>
      </header>

      {/* Form Container */}
      <section className="max-w-3xl mx-auto mt-12 px-6 pb-20 w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs tracking-wider uppercase text-gray-400 mb-3 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FB3640]" />
            On-Chain Escrow Protocol
          </div>
          <h1 className="font-kontras text-5xl md:text-6xl font-bold tracking-tight text-white">
            Find Your <span className="text-gradient-coral italic font-normal">Lost Item</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-3 max-w-lg mx-auto">
            Register your lost item with cryptographic hashes. Your ETH reward will be held securely in escrow until you confirm the return.
          </p>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden">
{/* Success Message */}
        {submitStatus === 'success' && (
          <Alert className="mb-6 border-emerald-500/40 bg-emerald-500/10 text-emerald-300 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-emerald-300 font-semibold">Success!</AlertTitle>
            <AlertDescription className="text-emerald-200 text-sm">
              {submitMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <Alert className="mb-6 border-[#FB3640]/40 bg-[#FB3640]/10 text-red-300 rounded-xl">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-300 font-semibold">Error</AlertTitle>
            <AlertDescription className="text-red-200 text-sm">
              {submitMessage}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Dropdown */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-medium text-gray-300">Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="glass-input h-12 rounded-xl text-white w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-panel bg-[#000F08]/95 border-white/15 text-white">
                      {Object.entries(categoryData).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Start by selecting the main category of your lost item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subcategory Dropdown */}
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-medium text-gray-300">Subcategory</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedSubcategory(value);
                    }}
                    defaultValue={field.value}
                    disabled={!selectedCategory}
                  >
                    <FormControl>
                      <SelectTrigger className="glass-input h-12 rounded-xl text-white w-full">
                        <SelectValue placeholder={selectedCategory ? "Select a subcategory" : "Select category first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-panel bg-[#000F08]/95 border-white/15 text-white">
                      {Object.entries(availableSubcategories).map(([key, value]: [string, any]) => (
                        <SelectItem key={key} value={key}>
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Choose a more specific subcategory.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Item Type Dropdown */}
            <FormField
              control={form.control}
              name="itemType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-medium text-gray-300">Item Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedItemType(value);
                    }}
                    defaultValue={field.value}
                    disabled={!selectedSubcategory}
                  >
                    <FormControl>
                      <SelectTrigger className="glass-input h-12 rounded-xl text-white w-full">
                        <SelectValue placeholder={selectedSubcategory ? "Select an item type" : "Select subcategory first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-panel bg-[#000F08]/95 border-white/15 text-white">
                      {Object.entries(availableItems).map(([key, value]: [string, any]) => (
                        <SelectItem key={key} value={key}>
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Select the specific type of item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand Dropdown */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-medium text-gray-300">Brand</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedItemType}
                  >
                    <FormControl>
                      <SelectTrigger className="glass-input h-12 rounded-xl text-white w-full">
                        <SelectValue placeholder={selectedItemType ? "Select a brand" : "Select item type first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-panel bg-[#000F08]/95 border-white/15 text-white">
                      {availableBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Choose the brand of your item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Dropdown */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-medium text-gray-300">Color</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="glass-input h-12 rounded-xl text-white w-full">
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-panel bg-[#000F08]/95 border-white/15 text-white">
                      {colorOptions.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Primary color of the item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Distinct Features */}
            <FormField
              control={form.control}
              name="distinctFeatures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-medium text-gray-300">Distinct Features</FormLabel>
                  <FormControl>
<Textarea className="glass-input rounded-xl text-white min-h-[100px] resize-none"
                      placeholder="Describe unique features, scratches, stickers, engravings, serial numbers, etc."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Any unique identifiers that would help verify ownership.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Lost */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-medium text-gray-300">Location Lost</FormLabel>
                  <FormControl>
                    <Input className="glass-input h-12 rounded-xl text-white" placeholder="e.g., Student Center, Library 3rd Floor" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Where did you last see your item?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Lost */}
            <FormField
              control={form.control}
              name="dateLost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-medium text-gray-300">Date Lost</FormLabel>
                  <FormControl>
                    <Input type="date" className="glass-input h-12 rounded-xl text-white [color-scheme:dark]" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 mt-1">
                    When did you lose the item?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reward Amount */}
            <FormField
              control={form.control}
              name="rewardAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-medium text-gray-300">Reward Amount (ETH)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.001" 
                      min="0.001"
                      placeholder="0.001" 
                      className="glass-input h-12 rounded-xl text-white font-mono text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Minimum reward is 0.001 ETH. This will be locked in escrow and paid to the finder when matched.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="btn-imperial w-full py-6 text-base font-semibold rounded-xl flex items-center justify-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Lost Item Report'
              )}
            </Button>
          </form>
        </Form>
        </div>
      </section>

      {/* Profile Dialog */}
      <ProfileDialog 
        open={showProfileDialog} 
        onOpenChange={setShowProfileDialog}
        onProfileComplete={() => {
          // Retry form submission after profile is complete
          form.handleSubmit(onSubmit)();
        }}
      />
    </main>
  );
}
