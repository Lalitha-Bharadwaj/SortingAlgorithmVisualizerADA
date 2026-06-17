with Ada.Real_Time; use Ada.Real_Time;

package body Quick_Sort is

   function Sort (Input_Arr : Element_Vectors.Vector) return Sort_Result is
      Start_Time  : constant Time := Clock;
      Result      : Sort_Result;
      Arr         : Element_Vectors.Vector := Input_Arr;
      Step_Count  : Integer := 0;
      Max_Steps   : constant Integer := 2000;

      procedure Add_Step (Action : Action_Kind; I, J : Integer) is
         Step : Trace_Step;
      begin
         if Step_Count >= Max_Steps then return; end if;
         Step_Count := Step_Count + 1;
         Step.Step_Num := Step_Count;
         Step.Action := Action;
         if I >= 0 then
            Step.Indices.Append (I);
         end if;
         if J >= 0 then
            Step.Indices.Append (J);
         end if;
         Step.Arr := Arr;
         Result.Trace.Append (Step);
      end Add_Step;

      function Partition (Low, High : Integer) return Integer is
         Pivot_Val : constant Integer := Arr.Element (High);
         I         : Integer := Low - 1;
      begin
         -- Highlight pivot selection (0-indexed)
         Add_Step (Pivot, High - 1, -1);
         Result.Operations := Result.Operations + 1; -- Pivot read

         for J in Low .. High - 1 loop
            -- Record comparison with pivot
            Add_Step (Compare, J - 1, High - 1);
            Result.Comparisons := Result.Comparisons + 1;
            Result.Operations := Result.Operations + 1;

            if Arr.Element (J) <= Pivot_Val then
               I := I + 1;
               if I /= J then
                  declare
                     Temp : constant Integer := Arr.Element (I);
                  begin
                     Arr.Replace_Element (I, Arr.Element (J));
                     Arr.Replace_Element (J, Temp);
                  end;
                  Result.Swaps := Result.Swaps + 1;
                  Result.Operations := Result.Operations + 2; -- Two array writes

                  -- Record swap
                  Add_Step (Swap, I - 1, J - 1);
               end if;
            end if;
         end loop;

         -- Put pivot in its final position
         if I + 1 /= High then
            declare
               Temp : constant Integer := Arr.Element (I + 1);
            begin
               Arr.Replace_Element (I + 1, Arr.Element (High));
               Arr.Replace_Element (High, Temp);
            end;
            Result.Swaps := Result.Swaps + 1;
            Result.Operations := Result.Operations + 2; -- Two array writes

            -- Record swap
            Add_Step (Swap, I, High - 1);
         end if;

         return I + 1;
      end Partition;

      procedure Quick_Sort_Rec (Low, High : Integer) is
      begin
         if Low < High then
            declare
               Pivot_Idx : constant Integer := Partition (Low, High);
            begin
               -- Pivot_Idx is now in its final correct position
               Add_Step (Sorted, Pivot_Idx - 1, -1);

               Quick_Sort_Rec (Low, Pivot_Idx - 1);
               Quick_Sort_Rec (Pivot_Idx + 1, High);
            end;
         elsif Low = High then
            -- Single element is sorted
            Add_Step (Sorted, Low - 1, -1);
         end if;
      end Quick_Sort_Rec;

   begin
      Result.Comparisons := 0;
      Result.Swaps := 0;
      Result.Operations := 0;

      Quick_Sort_Rec (1, Integer (Arr.Length));

      -- Record elapsed time
      declare
         Elapsed : constant Time_Span := Clock - Start_Time;
         Elapsed_Sec : constant Duration := To_Duration (Elapsed);
      begin
         Result.Time_Ms := Float (Elapsed_Sec) * 1000.0;
      end;

      return Result;
   end Sort;

end Quick_Sort;
