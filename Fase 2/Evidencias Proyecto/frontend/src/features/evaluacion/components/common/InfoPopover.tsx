import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Info } from "lucide-react";

interface InfoPopoverProps {
  content: string;
}

export default function InfoPopover({ content }: InfoPopoverProps) {
  return (
    <div className="ml-6 sm:ml-8 lg:ml-10 mb-2">
      <Popover placement="bottom-start" showArrow={true}>
        <PopoverTrigger>
          <div className="group inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 border border-blue-200/60 hover:border-blue-300/80 rounded-full cursor-help transition-all duration-300 ease-out hover:scale-110 hover:shadow-md">
            <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="max-w-xs sm:max-w-sm p-3 sm:p-4 bg-white/95 backdrop-blur-sm border border-default-200/50 rounded-xl shadow-lg">
          <p className="text-xs sm:text-sm text-default-700 leading-relaxed font-medium break-words">
            {content}
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
