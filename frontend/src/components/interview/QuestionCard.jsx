import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardContent } from '../ui/Card';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const MAX_ANSWER_LENGTH = 3000;

export const QuestionCard = ({
  question,
  index,
  total,
  answer,
  onAnswerChange,
  onNext,
  onPrev,
  onSubmit,
  submitting,
  className
}) => {
  const answerLength = (answer ?? "").length;
  const isLast = index === total - 1;

  return (
    <Card className={cn("border-border shadow-sm flex flex-col min-h-[500px]", className)}>
      <CardContent className="p-6 flex flex-col flex-1">
        <h2 className="text-xl font-semibold text-text-primary mb-6 leading-relaxed">
          <span className="text-primary-500 mr-2">Q{index + 1}.</span>
          {question}
        </h2>

        <div className="flex-1 flex flex-col relative mb-6">
          <Textarea
            value={answer ?? ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="flex-1 resize-none h-full text-base leading-relaxed p-4"
            disabled={submitting}
            maxLength={MAX_ANSWER_LENGTH}
            autoFocus
          />
          <div className="absolute bottom-3 right-4 text-xs font-medium text-text-muted">
            {answerLength} / {MAX_ANSWER_LENGTH}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={index === 0 || submitting}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {isLast ? (
            <ConfirmDialog
              title="Submit Interview"
              message="Are you sure you're ready to submit your interview for AI evaluation? You cannot change your answers after this."
              confirmText="Yes, Submit"
              cancelText="Cancel"
              onConfirm={() => onSubmit("manual")}
            >
              <Button 
                variant="primary" 
                isLoading={submitting}
                rightIcon={<Check className="w-4 h-4" />}
                className="bg-success-600 hover:bg-success-700 text-white"
              >
                Submit Interview
              </Button>
            </ConfirmDialog>
          ) : (
            <Button
              variant="primary"
              onClick={onNext}
              disabled={submitting}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
